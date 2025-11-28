import { Component, LabBooking } from '@/types/inventory';
import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    runTransaction
} from 'firebase/firestore';
import { removeUndefined } from '@/lib/utils';


export interface ComponentOrder {
    id: string;
    userId: string;
    userName: string;
    items: { componentId: string; componentName: string; quantity: number }[];
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}

export interface InventoryOperationResult {
    success: boolean;
    error?: string;
    missingItems?: string[];
}

export const InventoryService = {
    getComponents: async (): Promise<Component[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'components'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Component));
        } catch (error) {
            console.error("Error fetching components:", error);
            return [];
        }
    },

    searchComponents: async (queryText: string): Promise<Component[]> => {
        const components = await InventoryService.getComponents();
        if (!queryText) return components;
        const lowerQuery = queryText.toLowerCase();
        return components.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.category.toLowerCase().includes(lowerQuery)
        );
    },

    getBookings: async (): Promise<LabBooking[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'bookings'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabBooking));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    },

    createBooking: async (booking: Omit<LabBooking, 'id' | 'status'>): Promise<LabBooking> => {
        try {
            const newBookingData = {
                ...booking,
                status: 'pending'
            };
            const docRef = await addDoc(collection(db, 'bookings'), removeUndefined(newBookingData));

            return { id: docRef.id, ...newBookingData } as LabBooking;
        } catch (error) {
            console.error("Error creating booking:", error);
            throw error;
        }
    },

    addComponent: async (component: Omit<Component, 'id'>): Promise<Component> => {
        try {
            const docRef = await addDoc(collection(db, 'components'), removeUndefined(component));
            return { id: docRef.id, ...component } as Component;

        } catch (error) {
            console.error("Error adding component:", error);
            throw error;
        }
    },

    getOrders: async (): Promise<ComponentOrder[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'orders'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComponentOrder));
        } catch (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
    },

    createOrder: async (order: Omit<ComponentOrder, 'id' | 'status' | 'date'>): Promise<ComponentOrder> => {
        try {
            const newOrderData = {
                ...order,
                status: 'pending',
                date: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'orders'), removeUndefined(newOrderData));

            return { id: docRef.id, ...newOrderData } as ComponentOrder;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    getBookingStats: async (userId: string) => {
        try {
            const q = query(collection(db, 'bookings'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const bookings = querySnapshot.docs.map(doc => doc.data() as LabBooking);

            return {
                total: bookings.length,
                approved: bookings.filter(b => b.status === 'approved').length,
                pending: bookings.filter(b => b.status === 'pending').length,
                rejected: bookings.filter(b => b.status === 'rejected').length
            };
        } catch (error) {
            console.error("Error getting stats:", error);
            return { total: 0, approved: 0, pending: 0, rejected: 0 };
        }
    },

    approveBooking: async (bookingId: string): Promise<InventoryOperationResult> => {
        try {
            await runTransaction(db, async (transaction) => {
                const bookingRef = doc(db, 'bookings', bookingId);
                const bookingDoc = await transaction.get(bookingRef);

                if (!bookingDoc.exists()) {
                    throw new Error("Booking does not exist!");
                }

                const booking = bookingDoc.data() as LabBooking;

                if (booking.components && booking.components.length > 0) {
                    const missingItems: string[] = [];
                    const componentUpdates: { ref: any, newQuantity: number }[] = [];

                    // Check all items first
                    for (const item of booking.components) {
                        const componentRef = doc(db, 'components', item.componentId);
                        const componentDoc = await transaction.get(componentRef);

                        if (!componentDoc.exists()) {
                            missingItems.push(`${item.componentName} (Not Found)`);
                            continue;
                        }

                        const component = componentDoc.data() as Component;
                        if (component.availableQuantity < item.quantity) {
                            missingItems.push(`${component.name} (Requested: ${item.quantity}, Available: ${component.availableQuantity})`);
                        } else {
                            componentUpdates.push({
                                ref: componentRef,
                                newQuantity: component.availableQuantity - item.quantity
                            });
                        }
                    }

                    if (missingItems.length > 0) {
                        throw new Error(JSON.stringify({ type: 'STOCK_SHORTAGE', items: missingItems }));
                    }

                    // Apply updates if no missing items
                    for (const update of componentUpdates) {
                        transaction.update(update.ref, {
                            availableQuantity: update.newQuantity
                        });
                    }
                }

                transaction.update(bookingRef, { status: 'approved' });
            });
            return { success: true };
        } catch (error: any) {
            console.error("Transaction failed: ", error);
            try {
                const parsedError = JSON.parse(error.message);
                if (parsedError.type === 'STOCK_SHORTAGE') {
                    return { success: false, error: 'Stock shortage', missingItems: parsedError.items };
                }
            } catch (e) {
                // Not a JSON error
            }
            return { success: false, error: error.message || "Unknown error" };
        }
    },

    rejectBooking: async (bookingId: string): Promise<boolean> => {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, { status: 'rejected' });
            return true;
        } catch (error) {
            console.error("Error rejecting booking:", error);
            return false;
        }
    },

    updateOrderStatus: async (orderId: string, status: 'approved' | 'rejected'): Promise<InventoryOperationResult> => {
        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists()) {
                    throw new Error("Order does not exist!");
                }

                const order = orderDoc.data() as ComponentOrder;

                if (status === 'approved' && order.status !== 'approved') {
                    const missingItems: string[] = [];
                    const componentUpdates: { ref: any, newQuantity: number }[] = [];

                    // Check all items first
                    for (const item of order.items) {
                        const componentRef = doc(db, 'components', item.componentId);
                        const componentDoc = await transaction.get(componentRef);

                        if (!componentDoc.exists()) {
                            missingItems.push(`${item.componentName} (Not Found)`);
                            continue;
                        }

                        const component = componentDoc.data() as Component;
                        if (component.availableQuantity < item.quantity) {
                            missingItems.push(`${component.name} (Requested: ${item.quantity}, Available: ${component.availableQuantity})`);
                        } else {
                            componentUpdates.push({
                                ref: componentRef,
                                newQuantity: component.availableQuantity - item.quantity
                            });
                        }
                    }

                    if (missingItems.length > 0) {
                        throw new Error(JSON.stringify({ type: 'STOCK_SHORTAGE', items: missingItems }));
                    }

                    // Apply updates
                    for (const update of componentUpdates) {
                        transaction.update(update.ref, {
                            availableQuantity: update.newQuantity
                        });
                    }
                }

                transaction.update(orderRef, { status });
            });
            return { success: true };
        } catch (error: any) {
            console.error("Error updating order status:", error);
            try {
                const parsedError = JSON.parse(error.message);
                if (parsedError.type === 'STOCK_SHORTAGE') {
                    return { success: false, error: 'Stock shortage', missingItems: parsedError.items };
                }
            } catch (e) {
                // Not a JSON error
            }
            return { success: false, error: error.message || "Unknown error" };
        }
    }
    ,

    updateComponent: async (componentId: string, updates: Partial<Component>): Promise<void> => {
        try {
            const componentRef = doc(db, 'components', componentId);
            await updateDoc(componentRef, removeUndefined(updates));
        } catch (error) {
            console.error("Error updating component:", error);
            throw error;
        }
    }
};

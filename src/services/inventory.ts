import { Component, LabBooking } from '@/types/inventory';

export interface ComponentOrder {
    id: string;
    userId: string;
    userName: string;
    items: { componentId: string; componentName: string; quantity: number }[];
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}

const MOCK_COMPONENTS: Component[] = [
    { id: '1', name: 'Arduino Uno', category: 'microcontroller', totalQuantity: 20, availableQuantity: 15, description: 'Standard microcontroller board' },
    { id: '2', name: 'Raspberry Pi 4', category: 'microcontroller', totalQuantity: 10, availableQuantity: 2, description: 'Single-board computer' },
    { id: '3', name: 'Ultrasonic Sensor (HC-SR04)', category: 'sensor', totalQuantity: 50, availableQuantity: 48, description: 'Distance measuring sensor' },
    { id: '4', name: 'Servo Motor (SG90)', category: 'actuator', totalQuantity: 30, availableQuantity: 0, description: 'Micro servo motor' },
    { id: '5', name: 'DHT11', category: 'sensor', totalQuantity: 40, availableQuantity: 35, description: 'Temperature and humidity sensor' },
];

const COMPONENT_STORAGE_KEY = 'stemlab_components';
const BOOKING_STORAGE_KEY = 'stemlab_bookings';
const ORDER_STORAGE_KEY = 'stemlab_orders';

export const InventoryService = {
    getComponents: (): Component[] => {
        if (typeof window === 'undefined') return MOCK_COMPONENTS;
        const stored = localStorage.getItem(COMPONENT_STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(COMPONENT_STORAGE_KEY, JSON.stringify(MOCK_COMPONENTS));
            return MOCK_COMPONENTS;
        }
        return JSON.parse(stored);
    },

    searchComponents: (query: string): Component[] => {
        const components = InventoryService.getComponents();
        if (!query) return components;
        const lowerQuery = query.toLowerCase();
        return components.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.category.toLowerCase().includes(lowerQuery)
        );
    },

    getBookings: (): LabBooking[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    createBooking: (booking: Omit<LabBooking, 'id' | 'status'>): LabBooking => {
        const bookings = InventoryService.getBookings();
        const newBooking: LabBooking = {
            ...booking,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending'
        };
        bookings.push(newBooking);
        localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
        return newBooking;
    },

    addComponent: (component: Omit<Component, 'id'>): Component => {
        const components = InventoryService.getComponents();
        const newComponent: Component = {
            ...component,
            id: Math.random().toString(36).substr(2, 9)
        };
        components.push(newComponent);
        localStorage.setItem(COMPONENT_STORAGE_KEY, JSON.stringify(components));
        return newComponent;
    },

    getOrders: (): ComponentOrder[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(ORDER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    createOrder: (order: Omit<ComponentOrder, 'id' | 'status' | 'date'>): ComponentOrder => {
        const orders = InventoryService.getOrders();
        const newOrder: ComponentOrder = {
            ...order,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            date: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
        return newOrder;
    },

    getBookingStats: (userId: string) => {
        const bookings = InventoryService.getBookings().filter(b => b.userId === userId);
        return {
            total: bookings.length,
            approved: bookings.filter(b => b.status === 'approved').length,
            pending: bookings.filter(b => b.status === 'pending').length,
            rejected: bookings.filter(b => b.status === 'rejected').length
        };
    }
};

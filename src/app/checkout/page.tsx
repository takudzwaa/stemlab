'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService } from '@/services/inventory';

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart } = useCart();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handlePlaceOrder = async () => {
        if (!user) {
            alert('Please log in to place an order.');
            router.push('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            await InventoryService.createOrder({
                userId: user.id,
                userName: user.name,
                items: cart.map(item => ({
                    componentId: item.component.id,
                    componentName: item.component.name,
                    quantity: item.quantity
                }))
            });

            clearCart();
            alert('Order placed successfully!');

            // Redirect based on role
            if (user.role === 'student') {
                router.push('/student');
            } else {
                router.push('/admin'); // Or wherever staff should go
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Checkout</h1>
                <p className="mb-4">Your cart is empty.</p>
                <Link href="/student" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Summary */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Order Summary</h2>
                    <div className="card">
                        {cart.map((item) => (
                            <div key={item.component.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid var(--color-border)',
                                padding: '0.75rem 0'
                            }}>
                                <div>
                                    <h3 style={{ fontWeight: '500' }}>{item.component.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Quantity: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold',
                            fontSize: '1.125rem'
                        }}>
                            <span>Total Items</span>
                            <span>{getCartTotal()}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Actions */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Confirm Order</h2>
                    <div className="card">
                        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                            Please review your items before placing the order.
                        </p>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting}
                            className="btn btn-primary w-full"
                            style={{ opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartSidebar() {
    const { cart, removeFromCart, clearCart, getCartTotal, isCartOpen, closeCart } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={closeCart}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998
                }}
            />

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '350px',
                backgroundColor: 'white',
                boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Cart</h2>
                    <button
                        onClick={closeCart}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {cart.length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map((item) => (
                                <div key={item.component.id} style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '0.5rem',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.component.name}</h4>
                                        <p style={{ fontSize: '0.875rem', color: '#666' }}>Quantity: {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.component.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold' }}>
                            <span>Total Items:</span>
                            <span>{getCartTotal()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={clearCart}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Cart
                            </button>
                            <Link
                                href="/checkout"
                                onClick={closeCart}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

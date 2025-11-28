'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Component } from '@/types/inventory';

export interface CartItem {
    component: Component;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (component: Component) => void;
    removeFromCart: (componentId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem('stemlab_cart');
            if (storedCart) {
                try {
                    setCart(JSON.parse(storedCart));
                } catch (e) {
                    console.error('Failed to parse cart from local storage');
                }
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('stemlab_cart', JSON.stringify(cart));
        }
    }, [cart]);

    const addToCart = (component: Component) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.component.id === component.id);
            if (existing) {
                if (existing.quantity < Number(component.availableQuantity)) {
                    return prevCart.map(item =>
                        item.component.id === component.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    alert('Max available quantity reached for this item.');
                    return prevCart;
                }
            } else {
                return [...prevCart, { component, quantity: 1 }];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (componentId: string) => {
        setCart(prevCart => prevCart.filter(item => item.component.id !== componentId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            getCartTotal,
            isCartOpen,
            openCart,
            closeCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService, ComponentOrder } from '@/services/inventory';
import { User } from '@/types/user';
import { Component } from '@/types/inventory';
import { Button, Input, Card } from '@/components/UI';

export default function LecturerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'lab' | 'projector' | 'components'>('lab');

    // Component Ordering State
    const [searchQuery, setSearchQuery] = useState('');
    const [components, setComponents] = useState<Component[]>([]);
    const [cart, setCart] = useState<{ component: Component; quantity: number }[]>([]);
    const [myOrders, setMyOrders] = useState<ComponentOrder[]>([]);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'lecturer') {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        setComponents(InventoryService.getComponents());
        loadOrders(currentUser.id);
    }, []);

    const loadOrders = (userId: string) => {
        const allOrders = InventoryService.getOrders();
        setMyOrders(allOrders.filter(o => o.userId === userId));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setComponents(InventoryService.searchComponents(e.target.value));
    };

    const addToCart = (component: Component) => {
        const existing = cart.find(item => item.component.id === component.id);
        if (existing) {
            if (existing.quantity < component.availableQuantity) {
                setCart(cart.map(item =>
                    item.component.id === component.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            } else {
                alert('Max quantity reached');
            }
        } else {
            setCart([...cart, { component, quantity: 1 }]);
        }
    };

    const removeFromCart = (componentId: string) => {
        setCart(cart.filter(item => item.component.id !== componentId));
    };

    const submitOrder = () => {
        if (!user || cart.length === 0) return;

        InventoryService.createOrder({
            userId: user.id,
            userName: user.name,
            items: cart.map(item => ({
                componentId: item.component.id,
                componentName: item.component.name,
                quantity: item.quantity
            }))
        });

        setCart([]);
        loadOrders(user.id);
        alert('Order submitted successfully!');
    };

    if (!user) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Lecturer Dashboard</h1>

            <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('lab')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: activeTab === 'lab' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'lab' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Lab Request
                    </button>
                    <button
                        onClick={() => setActiveTab('projector')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: activeTab === 'projector' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'projector' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Projector Booking
                    </button>
                    <button
                        onClick={() => setActiveTab('components')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: activeTab === 'components' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'components' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Order Components
                    </button>
                </div>
            </div>

            {activeTab === 'lab' && (
                <Card title="Request Lab Utilization">
                    <form className="flex flex-col gap-4">
                        <Input label="Course Code" placeholder="e.g., HIT400" required />
                        <Input label="Topic/Activity" placeholder="e.g., Arduino Basics" required />
                        <Input label="Date" type="date" required />
                        <div className="flex gap-4">
                            <Input label="Start Time" type="time" required />
                            <Input label="End Time" type="time" required />
                        </div>
                        <Input label="Number of Students" type="number" required />
                        <Input label="Requirements" placeholder="Software, Hardware, etc." />
                        <Button type="submit">Submit Request</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'projector' && (
                <Card title="Book Projector">
                    <form className="flex flex-col gap-4">
                        <Input label="Room Number" placeholder="e.g., B101" required />
                        <Input label="Date" type="date" required />
                        <div className="flex gap-4">
                            <Input label="Start Time" type="time" required />
                            <Input label="End Time" type="time" required />
                        </div>
                        <Button type="submit">Book Projector</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'components' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div style={{ gridColumn: 'span 2' }}>
                        <Card title="Component Inventory">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <Input
                                    label="Search Components"
                                    placeholder="Type to search..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {components.map(component => (
                                    <div key={component.id} style={{
                                        border: '1px solid var(--color-border)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{component.name}</h3>
                                            <div style={{ fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: 600 }}>Available:</span> {component.availableQuantity}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => addToCart(component)}
                                            disabled={component.availableQuantity === 0}
                                            style={{ marginTop: '1rem', width: '100%' }}
                                            variant="secondary"
                                        >
                                            Add to Order
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card title="Current Order">
                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>Empty cart.</p>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2 mb-4">
                                        {cart.map(item => (
                                            <div key={item.component.id} className="flex justify-between items-center" style={{ fontSize: '0.875rem', padding: '0.5rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                                                <div>{item.component.name} (x{item.quantity})</div>
                                                <button onClick={() => removeFromCart(item.component.id)} style={{ color: 'var(--color-alert)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={submitOrder} style={{ width: '100%' }}>Submit Order</Button>
                                </>
                            )}
                        </Card>
                        <Card title="My Orders">
                            {myOrders.length === 0 ? <p style={{ color: 'var(--color-text-secondary)' }}>No orders.</p> : (
                                <div className="flex flex-col gap-2">
                                    {myOrders.map(order => (
                                        <div key={order.id} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                                            <div style={{ color: 'var(--color-text-secondary)' }}>{order.status} • {order.items.length} items</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </main>
    );
}

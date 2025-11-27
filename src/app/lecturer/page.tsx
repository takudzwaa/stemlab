'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService, ComponentOrder } from '@/services/inventory';
import { User } from '@/types/user';
import { Component, LabBooking } from '@/types/inventory';
import { Button, Input, Card } from '@/components/UI';
import { useCart } from '@/context/CartContext';

export default function LecturerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'lab' | 'projector' | 'components' | 'student_bookings'>('lab');

    // Component Ordering State
    const [searchQuery, setSearchQuery] = useState('');
    const [components, setComponents] = useState<Component[]>([]);
    const [myOrders, setMyOrders] = useState<ComponentOrder[]>([]);

    // Student Bookings State
    const [studentBookings, setStudentBookings] = useState<LabBooking[]>([]);

    // Use global cart context
    const { cart, addToCart, removeFromCart, clearCart } = useCart();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'lecturer') {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        setComponents(InventoryService.getComponents());
        loadOrders(currentUser.id);
        loadStudentBookings();
    }, []);

    const loadOrders = (userId: string) => {
        const allOrders = InventoryService.getOrders();
        setMyOrders(allOrders.filter(o => o.userId === userId));
    };

    const loadStudentBookings = () => {
        const bookings = InventoryService.getBookings();
        // Filter for bookings that might be relevant to this lecturer (e.g., same course)
        // For now, showing all pending bookings for simplicity or all bookings
        setStudentBookings(bookings);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setComponents(InventoryService.searchComponents(e.target.value));
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

        clearCart();
        loadOrders(user.id);
        alert('Order submitted successfully!');
    };

    const handleApproveBooking = (bookingId: string) => {
        const success = InventoryService.approveBooking(bookingId);
        if (success) {
            alert('Booking approved successfully');
            loadStudentBookings();
        } else {
            alert('Failed to approve booking. Check inventory availability.');
        }
    };

    if (!user) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Lecturer Dashboard</h1>

            <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                <div className="flex gap-4" style={{ overflowX: 'auto' }}>
                    <button
                        onClick={() => setActiveTab('lab')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: activeTab === 'lab' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'lab' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
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
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
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
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Order Components
                    </button>
                    <button
                        onClick={() => setActiveTab('student_bookings')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: activeTab === 'student_bookings' ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === 'student_bookings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Student Bookings
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

                        {/* Show Cart Items attached to booking */}
                        {cart.length > 0 && (
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Components to Reserve:</h4>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                                    {cart.map(item => (
                                        <li key={item.component.id}>
                                            {item.component.name} (x{item.quantity})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

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

            {activeTab === 'student_bookings' && (
                <Card title="Student Bookings">
                    {studentBookings.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)' }}>No bookings found.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {studentBookings.map(booking => (
                                <div key={booking.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 style={{ fontWeight: 600 }}>{booking.purpose || 'Lab Session'}</h3>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                {booking.userName} • {booking.date} ({booking.startTime} - {booking.endTime})
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '999px',
                                            backgroundColor: booking.status === 'pending' ? '#FEF3C7' : booking.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                                            color: booking.status === 'pending' ? '#92400E' : booking.status === 'approved' ? '#065F46' : '#991B1B'
                                        }}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {booking.components && booking.components.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                            <strong>Requested Components:</strong>
                                            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                {booking.components.map((c, i) => (
                                                    <li key={i}>{c.componentName} (x{c.quantity})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {booking.status === 'pending' && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <Button onClick={() => handleApproveBooking(booking.id)} style={{ fontSize: '0.875rem' }}>Approve Booking</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </main>
    );
}

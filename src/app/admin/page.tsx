'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService, ComponentOrder } from '@/services/inventory';
import { User, UserRole } from '@/types/user';
import { LabBooking, Component } from '@/types/inventory';
import { Button, Card, Input } from '@/components/UI';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<LabBooking[]>([]);
    const [orders, setOrders] = useState<ComponentOrder[]>([]);
    const [components, setComponents] = useState<Component[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'orders' | 'inventory' | 'logs'>('users');

    // Modal states
    const [showAddResource, setShowAddResource] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form states
    const [resourceForm, setResourceForm] = useState({
        name: '',
        category: 'other' as Component['category'],
        totalQuantity: 0,
        availableQuantity: 0,
        description: ''
    });

    const [editUserForm, setEditUserForm] = useState({
        name: '',
        email: '',
        role: 'student' as UserRole
    });

    // Inventory Filter State
    const [inventoryFilter, setInventoryFilter] = useState<'all' | 'sensor' | 'microcontroller' | 'actuator' | 'other'>('all');

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            router.push('/login');
            return;
        }
        setCurrentUser(user);
        loadData();
    }, []);

    const loadData = async () => {
        const fetchedUsers = await AuthService.getUsers();
        setUsers(fetchedUsers);
        const fetchedBookings = await InventoryService.getBookings();
        setBookings(fetchedBookings);
        const fetchedOrders = await InventoryService.getOrders();
        setOrders(fetchedOrders);
        const fetchedComponents = await InventoryService.getComponents();
        setComponents(fetchedComponents);
    };

    const handleApprove = async (userId: string) => {
        await AuthService.approveUser(userId);
        loadData();
    };

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        await InventoryService.addComponent({
            ...resourceForm,
            availableQuantity: resourceForm.totalQuantity // Default available to total
        });
        setShowAddResource(false);
        setResourceForm({ name: '', category: 'other', totalQuantity: 0, availableQuantity: 0, description: '' });
        alert('Resource added successfully');
        loadData();
    };

    const startEditUser = (user: User) => {
        setEditingUser(user);
        setEditUserForm({ name: user.name, email: user.email, role: user.role });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        await AuthService.updateUser(editingUser.id, editUserForm);
        setEditingUser(null);
        loadData();
        alert('User updated successfully');
    };

    const handleApproveBooking = async (bookingId: string) => {
        const success = await InventoryService.approveBooking(bookingId);
        if (success) {
            alert('Booking approved successfully');
            loadData();
        } else {
            alert('Failed to approve booking. Check inventory availability.');
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        const success = await InventoryService.rejectBooking(bookingId);
        if (success) {
            alert('Booking rejected');
            loadData();
        }
    };

    const handleApproveOrder = async (orderId: string) => {
        const success = await InventoryService.updateOrderStatus(orderId, 'approved');
        if (success) {
            alert('Order approved successfully');
            loadData();
        } else {
            alert('Failed to approve order. Check inventory availability.');
        }
    };

    const handleRejectOrder = async (orderId: string) => {
        const success = await InventoryService.updateOrderStatus(orderId, 'rejected');
        if (success) {
            alert('Order rejected');
            loadData();
        }
    };

    const pendingUsers = users.filter(u => !u.isApproved);
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const pastOrders = orders.filter(o => o.status !== 'pending');

    const filteredComponents = inventoryFilter === 'all'
        ? components
        : components.filter(c => c.category === inventoryFilter);

    if (!currentUser) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Admin Dashboard</h1>
                <Button onClick={() => setShowAddResource(true)}>Add New Resource</Button>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', overflowX: 'auto' }}>
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                    {['users', 'bookings', 'orders', 'inventory', 'logs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none',
                                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: 500,
                                background: 'none',
                                borderTop: 'none',
                                borderLeft: 'none',
                                borderRight: 'none',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'users' ? 'User Management' :
                                tab === 'bookings' ? 'Booking Requests' :
                                    tab === 'orders' ? 'Component Orders' :
                                        tab === 'inventory' ? 'Inventory' : 'Booking Logs'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {/* Add Resource Modal (Inline for simplicity) */}
                {showAddResource && (
                    <Card title="Add New Resource" style={{ border: '2px solid var(--color-primary)' }}>
                        <form onSubmit={handleAddResource}>
                            <Input label="Name" value={resourceForm.name} onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} required />
                            <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Category</label>
                                <select
                                    value={resourceForm.category}
                                    onChange={e => setResourceForm({ ...resourceForm, category: e.target.value as any })}
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                                >
                                    <option value="sensor">Sensor</option>
                                    <option value="microcontroller">Microcontroller</option>
                                    <option value="actuator">Actuator</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Input label="Quantity" type="number" value={resourceForm.totalQuantity} onChange={e => setResourceForm({ ...resourceForm, totalQuantity: parseInt(e.target.value) })} required />
                            <Input label="Description" value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} required />
                            <div className="flex gap-4">
                                <Button type="button" variant="secondary" onClick={() => setShowAddResource(false)}>Cancel</Button>
                                <Button type="submit">Save Resource</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Edit User Modal (Inline) */}
                {editingUser && (
                    <Card title={`Edit User: ${editingUser.name}`} style={{ border: '2px solid var(--color-accent)' }}>
                        <form onSubmit={handleUpdateUser}>
                            <Input label="Name" value={editUserForm.name} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} required />
                            <Input label="Email" value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} required />
                            <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Role</label>
                                <select
                                    value={editUserForm.role}
                                    onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
                                <Button type="submit">Update User</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {activeTab === 'users' && (
                    <>
                        <Card title="Pending Approvals">
                            {pendingUsers.length === 0 ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>No pending user approvals.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {pendingUsers.map(user => (
                                        <div key={user.id} className="flex justify-between items-center p-4 border rounded" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user.email} • {user.role}</div>
                                            </div>
                                            <Button onClick={() => handleApprove(user.id)} style={{ fontSize: '0.875rem' }}>Approve</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card title="All Users">
                            <div className="flex flex-col gap-4">
                                {users.map(user => (
                                    <div key={user.id} className="flex justify-between items-center p-2 border-b" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <div>
                                            <span style={{ fontWeight: 500 }}>{user.name}</span>
                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>({user.role})</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: user.isApproved ? '#e6fffa' : '#fff5f5',
                                                color: user.isApproved ? '#047481' : '#c53030'
                                            }}>
                                                {user.isApproved ? 'Active' : 'Pending'}
                                            </span>
                                            <Button variant="secondary" onClick={() => startEditUser(user)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Edit</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                )}

                {activeTab === 'bookings' && (
                    <Card title="Booking Requests">
                        {pendingBookings.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)' }}>No pending booking requests.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {pendingBookings.map(booking => (
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
                                                backgroundColor: '#FEF3C7',
                                                color: '#92400E'
                                            }}>
                                                PENDING
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

                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={() => handleApproveBooking(booking.id)} style={{ fontSize: '0.875rem' }}>Approve</Button>
                                            <Button variant="secondary" onClick={() => handleRejectBooking(booking.id)} style={{ fontSize: '0.875rem', color: 'var(--color-alert)' }}>Reject</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'orders' && (
                    <>
                        <Card title="Pending Component Orders">
                            {pendingOrders.length === 0 ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>No pending component orders.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {pendingOrders.map(order => (
                                        <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 style={{ fontWeight: 600 }}>Order #{order.id.slice(0, 8)}</h3>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                        {order.userName} • {new Date(order.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: '#FEF3C7',
                                                    color: '#92400E'
                                                }}>
                                                    PENDING
                                                </span>
                                            </div>

                                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                                <strong>Items:</strong>
                                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                    {order.items.map((item, i) => (
                                                        <li key={i}>{item.componentName} (x{item.quantity})</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button onClick={() => handleApproveOrder(order.id)} style={{ fontSize: '0.875rem' }}>Approve</Button>
                                                <Button variant="secondary" onClick={() => handleRejectOrder(order.id)} style={{ fontSize: '0.875rem', color: 'var(--color-alert)' }}>Reject</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card title="Order History">
                            {pastOrders.length === 0 ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>No past orders.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {pastOrders.map(order => (
                                        <div key={order.id} className="flex justify-between items-center p-2 border-b" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                            <div>
                                                <span style={{ fontWeight: 500 }}>{order.userName}</span>
                                                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                    ({order.items.length} items) • {new Date(order.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: order.status === 'approved' ? '#DEF7EC' : '#FDE8E8',
                                                color: order.status === 'approved' ? '#03543F' : '#9B1C1C'
                                            }}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {activeTab === 'inventory' && (
                    <Card title="Inventory Management">
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {['all', 'sensor', 'microcontroller', 'actuator', 'other'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setInventoryFilter(cat as any)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '999px',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: inventoryFilter === cat ? 'var(--color-primary)' : 'white',
                                        color: inventoryFilter === cat ? 'white' : 'var(--color-text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredComponents.map(component => (
                                <div key={component.id} style={{
                                    border: '1px solid var(--color-border)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{component.name}</h3>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '4px',
                                                backgroundColor: '#EBF5FF',
                                                color: '#1E429F',
                                                textTransform: 'uppercase'
                                            }}>
                                                {component.category}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{component.description}</p>
                                        <div className="flex justify-between items-center mt-2" style={{ fontSize: '0.875rem' }}>
                                            <span><strong>Total:</strong> {component.totalQuantity}</span>
                                            <span style={{ color: component.availableQuantity === 0 ? 'red' : 'green', fontWeight: 600 }}>
                                                Available: {component.availableQuantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeTab === 'logs' && (
                    <Card title="Approved Booking Logs">
                        {approvedBookings.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)' }}>No approved booking history.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {approvedBookings.map(booking => (
                                    <div key={booking.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-alt)' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 style={{ fontWeight: 600 }}>{booking.purpose || 'Lab Session'}</h3>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                    {booking.userName} • {booking.date}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '999px',
                                                backgroundColor: '#D1FAE5',
                                                color: '#065F46'
                                            }}>
                                                APPROVED
                                            </span>
                                        </div>

                                        {booking.components && booking.components.length > 0 && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                                <strong>Components Used:</strong>
                                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                    {booking.components.map((c, i) => (
                                                        <li key={i}>{c.componentName} (x{c.quantity})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </main>
    );
}

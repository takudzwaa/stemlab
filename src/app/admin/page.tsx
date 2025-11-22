'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService } from '@/services/inventory';
import { User, UserRole } from '@/types/user';
import { LabBooking, Component } from '@/types/inventory';
import { Button, Card, Input } from '@/components/UI';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<LabBooking[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

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

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            router.push('/login');
            return;
        }
        setCurrentUser(user);
        loadData();
    }, []);

    const loadData = () => {
        setUsers(AuthService.getUsers());
        setBookings(InventoryService.getBookings());
    };

    const handleApprove = (userId: string) => {
        AuthService.approveUser(userId);
        loadData();
    };

    const handleAddResource = (e: React.FormEvent) => {
        e.preventDefault();
        InventoryService.addComponent({
            ...resourceForm,
            availableQuantity: resourceForm.totalQuantity // Default available to total
        });
        setShowAddResource(false);
        setResourceForm({ name: '', category: 'other', totalQuantity: 0, availableQuantity: 0, description: '' });
        alert('Resource added successfully');
    };

    const startEditUser = (user: User) => {
        setEditingUser(user);
        setEditUserForm({ name: user.name, email: user.email, role: user.role });
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        AuthService.updateUser(editingUser.id, editUserForm);
        setEditingUser(null);
        loadData();
        alert('User updated successfully');
    };

    const pendingUsers = users.filter(u => !u.isApproved);

    if (!currentUser) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--color-primary)' }}>Admin Dashboard</h1>
                <Button onClick={() => setShowAddResource(true)}>Add New Resource</Button>
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
            </div>
        </main>
    );
}

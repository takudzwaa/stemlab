'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { InventoryService } from '@/services/inventory';
import { User } from '@/types/user';
import { Card, Button } from '@/components/UI';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const userStats = await InventoryService.getBookingStats(currentUser.id);
                setStats(userStats);
            }
            setLoading(false);
        };
        init();
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (!user) return <div>Please log in to view your profile.</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>My Profile</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>View your account information and activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="md:col-span-1">
                    <Card title="Account Details">
                        <div className="flex flex-col items-center mb-6">
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem'
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user.name}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-secondary)',
                                color: 'var(--color-primary)',
                                marginTop: '0.5rem',
                                textTransform: 'capitalize'
                            }}>
                                {user.role}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                                <div style={{ fontWeight: 500 }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>User ID</label>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                    {user.id}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Account Status</label>
                                <div style={{ fontWeight: 500, color: user.isApproved ? 'green' : 'orange' }}>
                                    {user.isApproved ? 'Active' : 'Pending Approval'}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Stats Card */}
                <div className="md:col-span-2">
                    <Card title="Booking Statistics">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <StatBox label="Total Bookings" value={stats.total} color="blue" />
                            <StatBox label="Approved" value={stats.approved} color="green" />
                            <StatBox label="Pending" value={stats.pending} color="yellow" />
                            <StatBox label="Rejected" value={stats.rejected} color="red" />
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Recent Activity</h4>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                You have {stats.pending} pending booking requests. Check the Bookings page for more details.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
    const colors: Record<string, string> = {
        blue: '#EBF5FF',
        green: '#DEF7EC',
        yellow: '#FEF3C7',
        red: '#FDE8E8'
    };
    const textColors: Record<string, string> = {
        blue: '#1E40AF',
        green: '#03543F',
        yellow: '#92400E',
        red: '#9B1C1C'
    };

    return (
        <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: colors[color] || '#F3F4F6',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: textColors[color] || 'black' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textColors[color] || 'gray', textTransform: 'uppercase' }}>
                {label}
            </div>
        </div>
    );
}

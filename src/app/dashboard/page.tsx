'use client';

import { useEffect, useState } from 'react';
import { InventoryService } from '@/services/inventory';
import { AuthService } from '@/services/auth';
import { LabBooking } from '@/types/inventory';
import { Card } from '@/components/UI';

export default function DashboardOverview() {
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [upcomingBookings, setUpcomingBookings] = useState<LabBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            const userStats = InventoryService.getBookingStats(user.id);
            setStats(userStats);

            const allBookings = InventoryService.getBookings();
            const userBookings = allBookings
                .filter(b => b.userId === user.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5); // Get latest 5
            setUpcomingBookings(userBookings);
        }
        setLoading(false);
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Dashboard</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>View your booking summary and upcoming reservations.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Bookings" value={stats.total} label="All time booking count" icon="📅" />
                <StatCard title="Approved" value={stats.approved} label="Confirmed bookings" icon="✅" />
                <StatCard title="Pending" value={stats.pending} label="Awaiting approval" icon="🕒" />
                <StatCard title="Rejected" value={stats.rejected} label="Declined bookings" icon="❌" />
            </div>

            {/* Upcoming Bookings */}
            <Card title="Upcoming Bookings">
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>View and manage your upcoming bookings</p>

                {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                        No upcoming bookings found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'white'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{booking.courseCode} - {booking.topic}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                        {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: booking.status === 'approved' ? '#DEF7EC' : booking.status === 'rejected' ? '#FDE8E8' : '#FEF3C7',
                                    color: booking.status === 'approved' ? '#03543F' : booking.status === 'rejected' ? '#9B1C1C' : '#92400E'
                                }}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function StatCard({ title, value, label, icon }: { title: string, value: number, label: string, icon: string }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '140px'
        }}>
            <div className="flex justify-between items-start">
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{label}</div>
            </div>
        </div>
    );
}

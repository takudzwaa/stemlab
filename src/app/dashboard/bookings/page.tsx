'use client';

import { useEffect, useState } from 'react';
import { InventoryService } from '@/services/inventory';
import { AuthService } from '@/services/auth';
import { LabBooking } from '@/types/inventory';
import { Card } from '@/components/UI';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<LabBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            const allBookings = InventoryService.getBookings();
            const userBookings = allBookings
                .filter(b => b.userId === user.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setBookings(userBookings);
        }
        setLoading(false);
    }, []);

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>My Bookings</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Manage your lab and equipment reservations</p>
            </div>

            <Card title="All Bookings">
                {bookings.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                        No bookings found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {bookings.map(booking => (
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
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                        Students: {booking.numberOfStudents} • Requirements: {booking.requirements}
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

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService } from '@/services/inventory';
import { User } from '@/types/user';
import { Button, Input, Card } from '@/components/UI';
import { useCart } from '@/context/CartContext';

export default function NewBookingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        courseCode: '',
        topic: '',
        numberOfStudents: 0,
        requirements: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Use global cart context
    const { cart, clearCart } = useCart();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            await InventoryService.createBooking({
                userId: user.id,
                userName: user.name,
                ...formData,
                components: cart.map(item => ({
                    componentId: item.component.id,
                    componentName: item.component.name,
                    quantity: item.quantity
                }))
            });

            clearCart();
            alert('Booking request submitted successfully!');
            router.push('/dashboard/bookings');
        } catch (err) {
            console.error(err);
            alert('Failed to submit booking');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>New Booking</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Book a lab session or equipment</p>
            </div>

            <Card className="w-full max-w-2xl mx-auto" title="Booking Details">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label="Course Code (Optional)"
                            value={formData.courseCode}
                            onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                            placeholder="e.g. CSC401"
                        />
                        <Input
                            label="Topic (Optional)"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            placeholder="e.g. Microcontrollers"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <Input
                            label="Start Time"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            required
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <Input
                            label="Number of Students (Optional)"
                            type="number"
                            value={formData.numberOfStudents}
                            onChange={(e) => setFormData({ ...formData, numberOfStudents: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Purpose / Description</label>
                        <textarea
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            required
                            rows={3}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                width: '100%',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Describe the purpose of this booking..."
                        />
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Special Requirements (Optional)</label>
                        <textarea
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            rows={2}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                width: '100%',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Show Cart Items attached to booking */}
                    {cart.length > 0 && (
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
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

                    <div className="flex gap-4 mt-6">
                        <Button type="button" variant="secondary" onClick={() => router.back()} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
                            Submit Request
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

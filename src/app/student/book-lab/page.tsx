'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { InventoryService } from '@/services/inventory';
import { User } from '@/types/user';
import { Button, Input, Card } from '@/components/UI';
import { useCart } from '@/context/CartContext';

export default function BookLabPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Use global cart context
    const { cart, clearCart } = useCart();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'student') {
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
            await new Promise(resolve => setTimeout(resolve, 500));
            InventoryService.createBooking({
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
            router.push('/student');
        } catch (err) {
            alert('Failed to submit booking');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <main className="container" style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <Card className="w-full max-w-lg" style={{ width: '100%', maxWidth: '600px' }} title="Book Practical Lab Session">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                    <div className="flex gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            className="flex-1"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            required
                        />
                        <Input
                            label="End Time"
                            type="time"
                            className="flex-1"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Purpose of Practical</label>
                        <textarea
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            required
                            rows={4}
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
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
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

                    <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                        <Button type="button" variant="secondary" onClick={() => router.back()} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
                            Submit Request
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
}

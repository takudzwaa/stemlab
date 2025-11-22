'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/UI';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        reminders: true,
        updates: true
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div>
            <div className="mb-6">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Settings</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Manage your account settings and preferences</p>
            </div>

            <Card title="Account Settings">
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Manage your account settings and preferences</p>

                <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                    <div className="flex gap-8">
                        <button style={{
                            padding: '0.5rem 0',
                            borderBottom: '2px solid var(--color-text-primary)',
                            fontWeight: 600,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            Notifications
                        </button>
                        <button style={{
                            padding: '0.5rem 0',
                            color: 'var(--color-text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            Appearance
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <ToggleItem
                        title="Email Notifications"
                        description="Receive email notifications about your bookings"
                        checked={notifications.email}
                        onChange={() => handleToggle('email')}
                    />
                    <ToggleItem
                        title="Booking Reminders"
                        description="Receive reminders about upcoming bookings"
                        checked={notifications.reminders}
                        onChange={() => handleToggle('reminders')}
                    />
                    <ToggleItem
                        title="Status Updates"
                        description="Receive updates when your booking status changes"
                        checked={notifications.updates}
                        onChange={() => handleToggle('updates')}
                    />
                </div>

                <div className="flex justify-end mt-8">
                    <Button onClick={() => alert('Settings saved!')}>Save Settings</Button>
                </div>
            </Card>
        </div>
    );
}

function ToggleItem({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: () => void }) {
    return (
        <div className="flex justify-between items-center" style={{ padding: '0.5rem 0' }}>
            <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{description}</div>
            </div>
            <div
                onClick={onChange}
                style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: checked ? 'var(--color-primary)' : '#E5E7EB',
                    borderRadius: '999px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
            >
                <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '26px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
            </div>
        </div>
    );
}

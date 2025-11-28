'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth';
import { Button, Input } from '@/components/UI';

export default function RegisterPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        staffId: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        const role = activeTab === 'student' ? 'student' : 'lecturer'; // Default staff to lecturer for now

        try {
            await AuthService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role,
                studentId: activeTab === 'student' ? formData.studentId : undefined,
                staffId: activeTab === 'staff' ? formData.staffId : undefined
            });

            alert('Registration successful! Please wait for admin approval.');
            router.push('/login');
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.code === 'auth/email-already-in-use') {
                alert('Email is already registered. Please login.');
            } else {
                alert('Registration failed: ' + (err.message || 'Unknown error'));
            }
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white'
        }}>
            {/* Header */}
            <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                    <img src="/logo.png" alt="CUT Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    CUT Booking System
                </Link>
                <div className="flex gap-4 items-center">
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>☀️</button>
                    <Link href="/login" style={{ fontWeight: 500 }}>Login</Link>
                    <Link href="/register" className="btn btn-primary">Register</Link>
                </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '450px' }}>
                    <div className="text-center mb-4">
                        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Register</h1>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Create an account to start booking</p>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-surface-alt)',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        marginBottom: '1.5rem'
                    }}>
                        <button
                            onClick={() => setActiveTab('student')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: activeTab === 'student' ? 'white' : 'transparent',
                                boxShadow: activeTab === 'student' ? 'var(--shadow-sm)' : 'none',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: activeTab === 'staff' ? 'white' : 'transparent',
                                boxShadow: activeTab === 'staff' ? 'var(--shadow-sm)' : 'none',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Staff
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        Register as a {activeTab} to book labs and equipment
                    </p>

                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder={activeTab === 'student' ? "student@cut.ac.zw" : "staff@cut.ac.zw"}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        {activeTab === 'student' && (
                            <Input
                                label="Student ID"
                                placeholder="Your student ID"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                required
                            />
                        )}
                        {activeTab === 'student' && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '-0.5rem' }}>
                                This ID will be used for login and cannot be changed later
                            </p>
                        )}
                        {activeTab === 'staff' && (
                            <Input
                                label="Staff ID"
                                placeholder="Your staff ID"
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                required
                            />
                        )}

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />

                        <Button type="submit" style={{ width: '100%', padding: '0.75rem' }}>Register</Button>
                    </form>

                    <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Login</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

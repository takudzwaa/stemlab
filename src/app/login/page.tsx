'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth';
import { Button, Input, Card } from '@/components/UI';

export default function LoginPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const user = await AuthService.login(email, password);
            if (user) {
                if (activeTab === 'student' && user.role !== 'student') {
                    setError('Invalid student credentials');
                    return;
                }
                if (activeTab === 'staff' && user.role === 'student') {
                    setError('Invalid staff credentials');
                    return;
                }

                if (user.role === 'admin') router.push('/admin');
                else router.push('/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.message === 'Account pending approval') {
                setError('Your account is waiting for admin approval. Please contact the administrator.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password. Please check your credentials or register if you are new.');
            } else {
                setError(err.message || 'Failed to login');
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
                        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Login</h1>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Enter your credentials to access your account</p>
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
                        Login with your {activeTab} credentials
                    </p>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            placeholder={activeTab === 'student' ? "student@cut.ac.zw" : "staff@cut.ac.zw"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div style={{
                            padding: '1rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <span>ℹ️</span>
                            Please log in using your registered email address.
                        </div>

                        <Button type="submit" style={{ width: '100%', padding: '0.75rem' }}>Login</Button>
                    </form>

                    <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                        Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Register</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

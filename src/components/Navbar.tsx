'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { User } from '@/types/user';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const { cart, openCart } = useCart();

    useEffect(() => {
        setUser(AuthService.getCurrentUser());
    }, [pathname]);

    const handleLogout = () => {
        AuthService.logout();
        setUser(null);
        router.push('/login');
    };

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <nav style={{
            backgroundColor: 'white',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{
                height: '4.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href={
                    !user ? '/' :
                        user.role === 'admin' ? '/admin' :
                            user.role === 'student' ? '/student' :
                                user.role === 'lecturer' ? '/lecturer' : '/'
                } style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <img src="/logo.png" alt="CUT Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    CUT Booking System
                </Link>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={openCart}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            position: 'relative',
                            marginRight: '1rem'
                        }}
                    >
                        🛒
                        {cart.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {cart.length}
                            </span>
                        )}
                    </button>
                    {!user ? (
                        <>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>☀️</button>
                            <Link href="/login" style={{ fontWeight: 500 }}>Login</Link>
                            <Link href="/register" className="btn btn-primary">Register</Link>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                {user.name}
                            </span>
                            {user.role === 'admin' && (
                                <Link href="/admin" className="btn btn-secondary">Dashboard</Link>
                            )}
                            {user.role === 'student' && (
                                <Link href="/student" className="btn btn-secondary">Dashboard</Link>
                            )}
                            {user.role === 'lecturer' && (
                                <Link href="/lecturer" className="btn btn-secondary">Dashboard</Link>
                            )}
                            <button onClick={handleLogout} style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-alert)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/types/user';

interface SidebarProps {
    user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { name: 'Overview', path: '/dashboard', icon: '88' }, // Using text icons for now, replace with SVGs if needed
        { name: 'Bookings', path: '/dashboard/bookings', icon: '📅' },
        { name: 'All Resources', path: '/dashboard/resources', icon: '📚' },
        { name: 'New Booking', path: '/dashboard/new-booking', icon: '⊕' },
    ];

    const resourceCategories = [
        { name: 'Labs', path: '/dashboard/resources?category=lab', icon: '🔬' },
        { name: 'Lab Equipment', path: '/dashboard/resources?category=equipment', icon: '⚗️' },
        { name: 'Project Components', path: '/dashboard/resources?category=component', icon: '⚙️' },
    ];

    return (
        <aside style={{
            width: '250px',
            backgroundColor: 'white',
            borderRight: '1px solid var(--color-border)',
            height: 'calc(100vh - 4.5rem)', // Subtract navbar height
            position: 'sticky',
            top: '4.5rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            overflowY: 'auto'
        }}>
            <div className="flex flex-col gap-1 mb-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            color: isActive(item.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            backgroundColor: isActive(item.path) ? 'var(--color-secondary)' : 'transparent',
                            fontWeight: isActive(item.path) ? 600 : 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </div>

            <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#9CA3AF',
                marginBottom: '0.5rem',
                paddingLeft: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                Resource Categories
            </div>
            <div className="flex flex-col gap-1 mb-6">
                {resourceCategories.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            color: pathname.includes(item.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            backgroundColor: pathname.includes(item.path) ? 'var(--color-secondary)' : 'transparent',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#9CA3AF',
                    marginBottom: '0.5rem',
                    paddingLeft: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Account
                </div>
                <Link
                    href="/dashboard/profile"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        color: isActive('/dashboard/profile') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        backgroundColor: isActive('/dashboard/profile') ? 'var(--color-secondary)' : 'transparent',
                        fontWeight: 500,
                        marginBottom: '0.25rem'
                    }}
                >
                    <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>👤</span>
                    Profile
                </Link>
                <Link
                    href="/dashboard/settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        color: isActive('/dashboard/settings') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        backgroundColor: isActive('/dashboard/settings') ? 'var(--color-secondary)' : 'transparent',
                        fontWeight: 500
                    }}
                >
                    <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>⚙️</span>
                    Settings
                </Link>
            </div>
        </aside>
    );
}

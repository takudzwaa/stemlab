import Link from 'next/link';
import { Card } from '@/components/UI';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#F0F9FF',
        padding: '4rem 0',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              lineHeight: 1.2,
              marginBottom: '1.5rem'
            }}>
              Chinhoyi<br />
              University of<br />
              Technology<br />
              <span style={{ fontSize: '2rem', color: '#0088CC' }}>Online Booking System</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '2rem',
              maxWidth: '500px'
            }}>
              Book rooms, labs, and equipment with ease. Our online booking system helps you manage resources efficiently.
            </p>
            <div className="flex gap-4">
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                Get Started
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', border: '1px solid var(--color-primary)' }}>
                Login
              </Link>
            </div>
          </div>

          {/* Calendar Widget Visualization */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '100%',
              maxWidth: '400px'
            }}>
              <div className="text-center mb-4">
                <img src="/logo.png" alt="CUT Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto' }} />
              </div>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Booking Calendar</h3>

              {/* Mock Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} style={{ fontWeight: 'bold', color: '#999' }}>{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: i === 14 ? 'var(--color-primary)' : 'transparent',
                    color: i === 14 ? 'white' : 'inherit'
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <div className="text-center mb-4">
          <span style={{
            backgroundColor: '#F3F4F6',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#4B5563'
          }}>
            Features
          </span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
            Everything You Need to Manage Bookings
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
            Our booking system provides all the tools you need to efficiently manage rooms, labs, and equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: '3rem' }}>
          <FeatureCard
            icon="📅"
            title="Calendar View"
            description="View available and booked slots in an intuitive calendar interface."
          />
          <FeatureCard
            icon="🕒"
            title="Real-time Booking"
            description="Book and cancel in real-time with instant updates for all users."
          />
          <FeatureCard
            icon="✉️"
            title="Email Confirmations"
            description="Receive email confirmations for all your booking activities."
          />
          <FeatureCard
            icon="👤"
            title="Admin Approval"
            description="Administrators can approve or reject booking requests."
          />
          <FeatureCard
            icon="🛡️"
            title="User Roles"
            description="Different access levels for administrators and regular users."
          />
          <FeatureCard
            icon="⚡"
            title="Booking Limits"
            description="Set limits on bookings per day or week to ensure fair usage."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="card text-center" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  );
}

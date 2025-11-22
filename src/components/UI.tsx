import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const Button = ({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) => {
    const baseClass = 'btn';
    const variantClass = variant === 'danger' ? 'btn-danger' : `btn-${variant}`;

    return (
        <button
            className={`${baseClass} ${variantClass} ${className || ''}`}
            disabled={isLoading || props.disabled}
            style={variant === 'danger' ? { backgroundColor: 'var(--color-alert)', color: 'white' } : {}}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
    return (
        <div className="flex flex-col gap-4" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</label>
            <input
                className={className}
                style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${error ? 'var(--color-alert)' : 'var(--color-border)'}`,
                    fontSize: '1rem',
                    width: '100%'
                }}
                {...props}
            />
            {error && <span style={{ color: 'var(--color-alert)', fontSize: '0.75rem' }}>{error}</span>}
        </div>
    );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}

export const Card = ({ children, className, title, ...props }: CardProps) => {
    return (
        <div className={`card ${className || ''}`} {...props}>
            {title && <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>}
            {children}
        </div>
    );
};

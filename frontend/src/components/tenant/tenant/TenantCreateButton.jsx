// frontend/src/components/tenant/TenantCreateButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './tenant.css';

const TenantCreateButton = ({ 
    variant = 'primary', 
    size = 'md', 
    className = '',
    fullWidth = false,
    showIcon = true,
    text = 'Create Tenant'
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/tenants/create');
    };

    const variants = {
        primary: { backgroundColor: '#2563eb', color: 'white' },
        secondary: { backgroundColor: '#e5e7eb', color: '#374151' },
        outline: { backgroundColor: 'transparent', border: '1px solid #2563eb', color: '#2563eb' },
        danger: { backgroundColor: '#dc2626', color: 'white' },
        success: { backgroundColor: '#10b981', color: 'white' },
    };

    const sizes = {
        sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    };

    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 500,
        borderRadius: '0.5rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
        border: 'none',
        width: fullWidth ? '100%' : 'auto',
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button onClick={handleClick} style={buttonStyle} className={className}>
            {showIcon && (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )}
            {text}
        </button>
    );
};

export default TenantCreateButton;
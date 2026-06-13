import React, { useState } from 'react';
import { FiCreditCard, FiLock, FiLoader } from 'react-icons/fi';
import './checkout.css';

export const CheckoutButton = ({ onClick, loading, disabled, variant = 'primary', size = 'md', children, className = '' }) => {
    const variants = { primary: 'checkout-btn-primary', secondary: 'checkout-btn-secondary', outline: 'checkout-btn-outline' };
    const sizes = { sm: 'checkout-btn-sm', md: 'checkout-btn-md', lg: 'checkout-btn-lg' };

    return (
        <button className={`checkout-btn ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled || loading}>
            {loading ? <FiLoader className="spin" /> : <FiCreditCard />}
            {children || (loading ? 'Processing...' : 'Checkout')}
            {!loading && <FiLock className="checkout-btn-lock" />}
        </button>
    );
};

export default CheckoutButton;
import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

export const CardBrandIcon = ({ brand, size = 24 }) => {
    const brandLower = brand?.toLowerCase();
    const colors = {
        visa: '#1A1F71',
        mastercard: '#EB001B',
        'american express': '#2E77BC',
        amex: '#2E77BC',
        discover: '#FF6000',
    };

    return <FiCreditCard size={size} color={colors[brandLower] || '#6B7280'} />;
};
import React from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from 'react-icons/fa';
import './shared.css';

const BRAND_ICONS = {
    visa: FaCcVisa,
    mastercard: FaCcMastercard,
    'american express': FaCcAmex,
    amex: FaCcAmex,
    discover: FaCcDiscover,
};

export const CardBrandIcon = ({ brand, size = 24, className = '' }) => {
    const IconComponent = BRAND_ICONS[brand?.toLowerCase()];
    if (!IconComponent) {
        return <FiCreditCard size={size} className={`card-brand-icon card-brand-default ${className}`} />;
    }
    return <IconComponent size={size} className={`card-brand-icon card-brand-${brand?.toLowerCase().replace(' ', '-')} ${className}`} />;
};

export default CardBrandIcon;
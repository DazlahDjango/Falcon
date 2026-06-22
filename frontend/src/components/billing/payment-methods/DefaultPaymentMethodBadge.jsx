import React from 'react';
import { FiStar } from 'react-icons/fi';
import './payment-methods.css';

export const DefaultPaymentMethodBadge = () => {
    return (
        <span className="default-badge">
            <FiStar /> Default
        </span>
    );
};

export default DefaultPaymentMethodBadge;
// frontend/src/components/tenant/domains/DomainSSLBadge.jsx
import React from 'react';
import './domains.css';

export const DomainSSLBadge = ({ expiryDate }) => {
    if (!expiryDate) {
        return <span className="domain-ssl-badge domain-ssl-expired">No SSL</span>;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return <span className="domain-ssl-badge domain-ssl-expired">SSL Expired</span>;
    }

    if (daysRemaining < 30) {
        return <span className="domain-ssl-badge domain-ssl-expiring">SSL Expires in {daysRemaining}d</span>;
    }

    return <span className="domain-ssl-badge domain-ssl-valid">SSL Active</span>;
};
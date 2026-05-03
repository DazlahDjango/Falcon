// frontend/src/components/tenant/domains/DomainStatusBadge.jsx
import React from 'react';
import './domains.css';

export const DomainStatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'active':
                return 'domain-status-active';
            case 'pending':
                return 'domain-status-pending';
            case 'verifying':
                return 'domain-status-verifying';
            case 'failed':
                return 'domain-status-failed';
            case 'expired':
                return 'domain-status-expired';
            default:
                return 'domain-status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'pending':
                return 'Pending';
            case 'verifying':
                return 'Verifying';
            case 'failed':
                return 'Failed';
            case 'expired':
                return 'Expired';
            default:
                return 'Unknown';
        }
    };

    return (
        <span className={`domain-status-badge ${getStatusClass()}`}>
            {getStatusLabel()}
        </span>
    );
};
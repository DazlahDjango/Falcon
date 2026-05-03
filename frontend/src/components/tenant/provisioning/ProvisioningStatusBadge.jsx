// frontend/src/components/tenant/provisioning/ProvisioningStatusBadge.jsx
import React from 'react';
import './provisioning.css';

export const ProvisioningStatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'completed':
                return 'provisioning-status-completed';
            case 'provisioning':
                return 'provisioning-status-provisioning';
            case 'failed':
                return 'provisioning-status-failed';
            case 'pending':
                return 'provisioning-status-pending';
            default:
                return 'provisioning-status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'completed':
                return 'Provisioning Complete';
            case 'provisioning':
                return 'Provisioning...';
            case 'failed':
                return 'Provisioning Failed';
            case 'pending':
                return 'Pending Provisioning';
            default:
                return 'Unknown';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'completed':
                return '✅';
            case 'provisioning':
                return '🔄';
            case 'failed':
                return '❌';
            case 'pending':
                return '⏳';
            default:
                return '📦';
        }
    };

    return (
        <span className={`provisioning-status-badge ${getStatusClass()}`}>
            {getIcon()} {getStatusLabel()}
        </span>
    );
};
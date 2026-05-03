// frontend/src/components/tenant/schema/SchemaStatusBadge.jsx
import React from 'react';
import './schema.css';

export const SchemaStatusBadge = ({ status, isReady }) => {
    const getStatusClass = () => {
        if (isReady && status === 'active') return 'schema-status-active';
        switch (status) {
            case 'active':
                return 'schema-status-active';
            case 'creating':
                return 'schema-status-creating';
            case 'migrating':
                return 'schema-status-migrating';
            case 'failed':
                return 'schema-status-failed';
            case 'pending':
                return 'schema-status-pending';
            default:
                return 'schema-status-pending';
        }
    };

    const getStatusLabel = () => {
        if (isReady && status === 'active') return 'Active & Ready';
        switch (status) {
            case 'active':
                return 'Active';
            case 'creating':
                return 'Creating';
            case 'migrating':
                return 'Migrating';
            case 'failed':
                return 'Failed';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    const getIcon = () => {
        if (isReady && status === 'active') return '✅';
        switch (status) {
            case 'active':
                return '🟢';
            case 'creating':
                return '🔄';
            case 'migrating':
                return '⚙️';
            case 'failed':
                return '❌';
            case 'pending':
                return '⏳';
            default:
                return '📦';
        }
    };

    return (
        <span className={`schema-status-badge ${getStatusClass()}`}>
            {getIcon()} {getStatusLabel()}
        </span>
    );
};
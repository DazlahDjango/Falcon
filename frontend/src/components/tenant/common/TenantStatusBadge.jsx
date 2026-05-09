// frontend/src/components/tenant/common/TenantStatusBadge.jsx
import React from 'react';
import { TENANT_QUERY_PARAMS } from '../../../config/constants/tenantConstants';

const { TENANT_STATUS } = TENANT_QUERY_PARAMS;

const statusConfig = {
    [TENANT_STATUS.ACTIVE]: {
        label: 'Active',
        className: 'tenant-badge-active',
        icon: '✓'
    },
    [TENANT_STATUS.INACTIVE]: {
        label: 'Inactive',
        className: 'tenant-badge-inactive',
        icon: '○'
    },
    [TENANT_STATUS.SUSPENDED]: {
        label: 'Suspended',
        className: 'tenant-badge-suspended',
        icon: '⚠'
    },
    [TENANT_STATUS.PENDING]: {
        label: 'Pending',
        className: 'tenant-badge-pending',
        icon: '⌛'
    },
    [TENANT_STATUS.PROVISIONING]: {
        label: 'Provisioning',
        className: 'tenant-badge-provisioning',
        icon: '⟳'
    },
    [TENANT_STATUS.DELETED]: {
        label: 'Deleted',
        className: 'tenant-badge-deleted',
        icon: '🗑'
    },
    [TENANT_STATUS.TRIAL]: {
        label: 'Trial',
        className: 'tenant-badge-trial',
        icon: '🎯'
    },
    [TENANT_STATUS.EXPIRED]: {
        label: 'Expired',
        className: 'tenant-badge-expired',
        icon: '⌛'
    }
};

const TenantStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
    const config = statusConfig[status] || {
        label: status || 'Unknown',
        className: 'tenant-badge-unknown',
        icon: '?'
    };

    const sizeClasses = {
        sm: 'tenant-badge-sm',
        md: 'tenant-badge-md',
        lg: 'tenant-badge-lg'
    };

    return (
        <span className={`tenant-badge ${sizeClasses[size]} ${config.className}`}>
            {showIcon && (
                <span className="tenant-badge-icon">
                    {config.icon}
                </span>
            )}
            {config.label}
        </span>
    );
};

export default TenantStatusBadge;
// frontend/src/components/tenant/common/TenantStatusBadge.jsx
import React from 'react';
import { TENANT_STATUS } from '../../../config/constants/tenantConstants';

const statusConfig = {
    [TENANT_STATUS.ACTIVE]: { label: 'Active', color: 'green', icon: '✓' },
    [TENANT_STATUS.INACTIVE]: { label: 'Inactive', color: 'gray', icon: '○' },
    [TENANT_STATUS.SUSPENDED]: { label: 'Suspended', color: 'red', icon: '⛔' },
    [TENANT_STATUS.PENDING]: { label: 'Pending', color: 'yellow', icon: '⏳' },
    [TENANT_STATUS.PROVISIONING]: { label: 'Provisioning', color: 'blue', icon: '⟳' },
    [TENANT_STATUS.DELETED]: { label: 'Deleted', color: 'gray', icon: '🗑' },
    [TENANT_STATUS.FAILED]: { label: 'Failed', color: 'red', icon: '✗' },
};

export const TenantStatusBadge = ({ status, size = 'md', showIcon = true }) => {
    const config = statusConfig[status] || statusConfig[TENANT_STATUS.INACTIVE];

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClasses[config.color]}`}>
            {showIcon && <span className="mr-1">{config.icon}</span>}
            {config.label}
        </span>
    );
};
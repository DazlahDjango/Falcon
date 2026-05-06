// frontend/src/components/tenant/common/TenantStatusBadge.jsx
import React from 'react';
import { TENANT_QUERY_PARAMS } from '../../../config/constants/tenantConstants';

const { TENANT_STATUS } = TENANT_QUERY_PARAMS;

const statusConfig = {
    [TENANT_STATUS.ACTIVE]: {
        label: 'Active',
        className: 'bg-green-100 text-green-800',
        icon: '✓'
    },
    [TENANT_STATUS.INACTIVE]: {
        label: 'Inactive',
        className: 'bg-gray-100 text-gray-800',
        icon: '○'
    },
    [TENANT_STATUS.SUSPENDED]: {
        label: 'Suspended',
        className: 'bg-red-100 text-red-800',
        icon: '⚠'
    },
    [TENANT_STATUS.PENDING]: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
        icon: '⌛'
    },
    [TENANT_STATUS.PROVISIONING]: {
        label: 'Provisioning',
        className: 'bg-blue-100 text-blue-800',
        icon: '⟳'
    },
    [TENANT_STATUS.DELETED]: {
        label: 'Deleted',
        className: 'bg-gray-100 text-gray-600',
        icon: '🗑'
    },
    [TENANT_STATUS.TRIAL]: {
        label: 'Trial',
        className: 'bg-purple-100 text-purple-800',
        icon: '🎯'
    },
    [TENANT_STATUS.EXPIRED]: {
        label: 'Expired',
        className: 'bg-orange-100 text-orange-800',
        icon: '⌛'
    }
};

const TenantStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
    const config = statusConfig[status] || {
        label: status || 'Unknown',
        className: 'bg-gray-100 text-gray-800',
        icon: '?'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.className}`}>
            {showIcon && (
                <span className="mr-1">
                    {config.icon}
                </span>
            )}
            {config.label}
        </span>
    );
};

export default TenantStatusBadge;
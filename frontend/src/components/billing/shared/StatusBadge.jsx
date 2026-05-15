import React from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIG = {
    // Subscription statuses
    active: { color: 'success', icon: '✓', label: 'Active' },
    trialing: { color: 'info', icon: '⏳', label: 'Trial' },
    past_due: { color: 'warning', icon: '⚠', label: 'Past Due' },
    cancelled: { color: 'secondary', icon: '✗', label: 'Cancelled' },
    expired: { color: 'error', icon: '⌛', label: 'Expired' },
    pending_cancellation: { color: 'warning', icon: '⟳', label: 'Pending Cancellation' },
    
    // Transaction statuses
    success: { color: 'success', icon: '✓', label: 'Success' },
    failed: { color: 'error', icon: '✗', label: 'Failed' },
    pending: { color: 'warning', icon: '⟳', label: 'Pending' },
    refunded: { color: 'info', icon: '↺', label: 'Refunded' },
    disputed: { color: 'error', icon: '⚖', label: 'Disputed' },
    
    // Invoice statuses
    paid: { color: 'success', icon: '✓', label: 'Paid' },
    overdue: { color: 'error', icon: '⚠', label: 'Overdue' },
    draft: { color: 'secondary', icon: '📄', label: 'Draft' },
};

export const StatusBadge = ({ status, customLabel = null, size = 'medium', showIcon = true }) => {
    const config = STATUS_CONFIG[status] || { color: 'default', icon: '●', label: status };
    const sizes = {
        small: 'status-badge-small',
        medium: 'status-badge-medium',
        large: 'status-badge-large',
    };

    return (
        <span className={`status-badge status-badge-${config.color} ${sizes[size]}`}>
            {showIcon && <span className="status-badge-icon">{config.icon}</span>}
            <span className="status-badge-label">{customLabel || config.label}</span>
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    customLabel: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showIcon: PropTypes.bool,
};

export default StatusBadge;
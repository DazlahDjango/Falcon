import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from './BillingIcons';

const STATUS_CONFIG = {
    // Subscription statuses
    active: { color: 'success', icon: renderBillingIcon('success'), label: 'Active' },
    trialing: { color: 'info', icon: renderBillingIcon('pending'), label: 'Trial' },
    past_due: { color: 'warning', icon: renderBillingIcon('warning'), label: 'Past Due' },
    cancelled: { color: 'secondary', icon: renderBillingIcon('cancelled'), label: 'Cancelled' },
    expired: { color: 'error', icon: renderBillingIcon('expired'), label: 'Expired' },
    pending_cancellation: { color: 'warning', icon: renderBillingIcon('pending_cancellation'), label: 'Pending Cancellation' },
    
    // Transaction statuses
    success: { color: 'success', icon: renderBillingIcon('success'), label: 'Success' },
    failed: { color: 'error', icon: renderBillingIcon('failed'), label: 'Failed' },
    pending: { color: 'warning', icon: renderBillingIcon('pending'), label: 'Pending' },
    refunded: { color: 'info', icon: renderBillingIcon('refunded'), label: 'Refunded' },
    disputed: { color: 'error', icon: renderBillingIcon('disputed'), label: 'Disputed' },
    
    // Invoice statuses
    paid: { color: 'success', icon: renderBillingIcon('success'), label: 'Paid' },
    overdue: { color: 'error', icon: renderBillingIcon('failed'), label: 'Overdue' },
    draft: { color: 'secondary', icon: renderBillingIcon('draft'), label: 'Draft' },
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
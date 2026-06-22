import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiClock, FiMinusCircle, FiGift, FiRefreshCw } from 'react-icons/fi';
import './shared.css';

const STATUS_CONFIG = {
    subscription: {
        active: { icon: FiCheckCircle, color: 'success', text: 'Active' },
        trialing: { icon: FiGift, color: 'info', text: 'Trial' },
        past_due: { icon: FiAlertTriangle, color: 'warning', text: 'Past Due' },
        cancelled: { icon: FiXCircle, color: 'secondary', text: 'Cancelled' },
        expired: { icon: FiClock, color: 'error', text: 'Expired' },
        pending_cancellation: { icon: FiMinusCircle, color: 'warning', text: 'Pending Cancellation' },
    },
    transaction: {
        success: { icon: FiCheckCircle, color: 'success', text: 'Success' },
        pending: { icon: FiClock, color: 'warning', text: 'Pending' },
        failed: { icon: FiAlertTriangle, color: 'error', text: 'Failed' },
        refunded: { icon: FiRefreshCw, color: 'info', text: 'Refunded' },
        disputed: { icon: FiAlertTriangle, color: 'error', text: 'Disputed' },
    },
    invoice: {
        paid: { icon: FiCheckCircle, color: 'success', text: 'Paid' },
        pending: { icon: FiClock, color: 'warning', text: 'Pending' },
        overdue: { icon: FiAlertTriangle, color: 'error', text: 'Overdue' },
        draft: { icon: FiMinusCircle, color: 'secondary', text: 'Draft' },
        cancelled: { icon: FiXCircle, color: 'secondary', text: 'Cancelled' },
        refunded: { icon: FiRefreshCw, color: 'info', text: 'Refunded' },
    },
    payment_method: {
        active: { icon: FiCheckCircle, color: 'success', text: 'Active' },
        default: { icon: FiCheckCircle, color: 'success', text: 'Default' },
        expired: { icon: FiClock, color: 'error', text: 'Expired' },
        removed: { icon: FiXCircle, color: 'secondary', text: 'Removed' },
    },
};

export const StatusBadge = ({ type, status, size = 'md', showIcon = true, showText = true, className = '' }) => {
    const config = STATUS_CONFIG[type]?.[status];
    if (!config) return <span className={`status-badge status-badge-unknown ${className}`}>Unknown</span>;

    const IconComponent = config.icon;
    const colorClass = `status-badge status-badge-${config.color} status-badge-${size}`;

    return (
        <span className={`${colorClass} ${className}`}>
            {showIcon && <IconComponent className="status-badge-icon" />}
            {showText && <span className="status-badge-text">{config.text}</span>}
        </span>
    );
};

export default StatusBadge;
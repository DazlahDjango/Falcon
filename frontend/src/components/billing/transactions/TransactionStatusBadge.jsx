import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import './transactions.css';

const STATUS_CONFIG = {
    success: { icon: FiCheckCircle, color: '#22c55e', label: 'Success', bg: '#dcfce7' },
    failed: { icon: FiXCircle, color: '#dc2626', label: 'Failed', bg: '#fee2e2' },
    pending: { icon: FiClock, color: '#f59e0b', label: 'Pending', bg: '#fef3c7' },
    refunded: { icon: FiRefreshCw, color: '#8b5cf6', label: 'Refunded', bg: '#ede9fe' },
    disputed: { icon: FiAlertTriangle, color: '#ef4444', label: 'Disputed', bg: '#fef2f2' }
};

export const TransactionStatusBadge = ({ status, size = 'md', showIcon = true, showText = true }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const IconComponent = config.icon;
    const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : 'badge-md';

    return (
        <span className={`transaction-status-badge ${sizeClass}`} style={{ background: config.bg, color: config.color }}>
            {showIcon && <IconComponent className="status-icon" />}
            {showText && <span>{config.label}</span>}
        </span>
    );
};

export default TransactionStatusBadge;
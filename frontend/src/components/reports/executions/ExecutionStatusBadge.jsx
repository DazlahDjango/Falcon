// frontend/src/components/reports/executions/ExecutionStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiClock, FiLoader, FiAlertCircle, FiZap } from 'react-icons/fi';
import './executions.css';

export const ExecutionStatusBadge = ({ status, size = 'medium', showLabel = true }) => {
    const getStatusConfig = (status) => {
        const configs = {
            pending: { icon: FiClock, label: 'Pending', className: 'pending', color: '#94a3b8' },
            running: { icon: FiLoader, label: 'Running', className: 'running', color: '#3b82f6' },
            completed: { icon: FiCheckCircle, label: 'Completed', className: 'completed', color: '#10b981' },
            failed: { icon: FiXCircle, label: 'Failed', className: 'failed', color: '#ef4444' },
            cancelled: { icon: FiXCircle, label: 'Cancelled', className: 'cancelled', color: '#64748b' },
            timeout: { icon: FiZap, label: 'Timeout', className: 'timeout', color: '#f59e0b' },
        };
        return configs[status] || configs.pending;
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    return (
        <span className={`execution-status-badge ${sizeClasses[size]} ${config.className}`}>
            <Icon size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            {showLabel && <span className="badge-label">{config.label}</span>}
        </span>
    );
};

ExecutionStatusBadge.propTypes = {
    status: PropTypes.oneOf(['pending', 'running', 'completed', 'failed', 'cancelled', 'timeout']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabel: PropTypes.bool,
};
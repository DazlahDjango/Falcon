// frontend/src/components/reports/exports/ExportStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiClock, FiLoader, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import './exports.css';

export const ExportStatusBadge = ({ status, size = 'medium', showLabel = true }) => {
    const getStatusConfig = (status) => {
        const configs = {
            queued: { icon: FiClock, label: 'Queued', className: 'queued', color: '#94a3b8' },
            processing: { icon: FiLoader, label: 'Processing', className: 'processing', color: '#3b82f6' },
            completed: { icon: FiCheckCircle, label: 'Completed', className: 'completed', color: '#10b981' },
            failed: { icon: FiXCircle, label: 'Failed', className: 'failed', color: '#ef4444' },
            cancelled: { icon: FiAlertCircle, label: 'Cancelled', className: 'cancelled', color: '#64748b' },
        };
        return configs[status] || configs.queued;
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    return (
        <span className={`export-status-badge ${sizeClasses[size]} ${config.className}`}>
            <Icon size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            {showLabel && <span className="badge-label">{config.label}</span>}
        </span>
    );
};

ExportStatusBadge.propTypes = {
    status: PropTypes.oneOf(['queued', 'processing', 'completed', 'failed', 'cancelled']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabel: PropTypes.bool,
};
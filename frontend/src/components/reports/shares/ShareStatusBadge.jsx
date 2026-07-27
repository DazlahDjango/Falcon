// frontend/src/components/reports/shares/ShareStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import './shares.css';

export const ShareStatusBadge = ({
    isActive = true,
    isExpired = false,
    size = 'medium',
    showLabel = true,
}) => {
    const getStatusConfig = () => {
        if (isExpired) {
            return {
                icon: FiClock,
                label: 'Expired',
                className: 'expired',
                color: '#94a3b8',
            };
        }
        if (!isActive) {
            return {
                icon: FiXCircle,
                label: 'Inactive',
                className: 'inactive',
                color: '#64748b',
            };
        }
        return {
            icon: FiCheckCircle,
            label: 'Active',
            className: 'active',
            color: '#10b981',
        };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    return (
        <span className={`share-status-badge ${sizeClasses[size]} ${config.className}`}>
            <Icon size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            {showLabel && <span className="badge-label">{config.label}</span>}
        </span>
    );
};

ShareStatusBadge.propTypes = {
    isActive: PropTypes.bool,
    isExpired: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabel: PropTypes.bool,
};
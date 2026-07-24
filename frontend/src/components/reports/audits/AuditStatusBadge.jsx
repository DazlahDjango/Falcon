// frontend/src/components/reports/audits/AuditStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './audits.css';

export const AuditStatusBadge = ({ success = true, size = 'medium', showLabel = true }) => {
    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    return (
        <span className={`audit-status-badge ${sizeClasses[size]} ${success ? 'success' : 'failed'}`}>
            {success ? (
                <FiCheckCircle size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            ) : (
                <FiXCircle size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            )}
            {showLabel && (
                <span className="badge-label">{success ? 'Success' : 'Failed'}</span>
            )}
        </span>
    );
};

AuditStatusBadge.propTypes = {
    success: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabel: PropTypes.bool,
};
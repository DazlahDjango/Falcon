import React from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIG = {
    success: {
        label: 'Success',
        color: 'success',
        icon: '✓',
    },
    pending: {
        label: 'Pending',
        color: 'warning',
        icon: '⟳',
    },
    failed: {
        label: 'Failed',
        color: 'error',
        icon: '✗',
    },
    refunded: {
        label: 'Refunded',
        color: 'info',
        icon: '↺',
    },
    disputed: {
        label: 'Disputed',
        color: 'error',
        icon: '⚖',
    },
};

export const TransactionStatusBadge = ({ status, size = 'medium' }) => {
    const config = STATUS_CONFIG[status] || {
        label: status,
        color: 'secondary',
        icon: '●',
    };

    const sizes = {
        small: 'transaction-status-small',
        medium: 'transaction-status-medium',
        large: 'transaction-status-large',
    };

    return (
        <span className={`transaction-status transaction-status-${config.color} ${sizes[size]}`}>
            <span className="transaction-status-icon">{config.icon}</span>
            <span className="transaction-status-label">{config.label}</span>
        </span>
    );
};

TransactionStatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default TransactionStatusBadge;
import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from '../shared/BillingIcons';

const STATUS_CONFIG = {
    success: {
        label: 'Success',
        color: 'success',
        icon: renderBillingIcon('success', { size: 14 }),
    },
    pending: {
        label: 'Pending',
        color: 'warning',
        icon: renderBillingIcon('pending', { size: 14 }),
    },
    failed: {
        label: 'Failed',
        color: 'error',
        icon: renderBillingIcon('failed', { size: 14 }),
    },
    refunded: {
        label: 'Refunded',
        color: 'info',
        icon: renderBillingIcon('refunded', { size: 14 }),
    },
    disputed: {
        label: 'Disputed',
        color: 'error',
        icon: renderBillingIcon('disputed', { size: 14 }),
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
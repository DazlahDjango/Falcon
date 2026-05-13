import React from 'react';
import PropTypes from 'prop-types';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    BoltIcon 
} from '@heroicons/react/24/solid';
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS } from '../../config/constants/billingConstants';

const STATUS_ICONS = {
    [SUBSCRIPTION_STATUS.ACTIVE]: CheckCircleIcon,
    [SUBSCRIPTION_STATUS.TRIALING]: BoltIcon,
    [SUBSCRIPTION_STATUS.PAST_DUE]: ExclamationTriangleIcon,
    [SUBSCRIPTION_STATUS.CANCELED]: XCircleIcon,
    [SUBSCRIPTION_STATUS.INCOMPLETE]: ClockIcon,
    [SUBSCRIPTION_STATUS.UNPAID]: ExclamationTriangleIcon,
    [SUBSCRIPTION_STATUS.SUSPENDED]: XCircleIcon,
    default: ClockIcon,
};
const SubscriptionStatusBadge = ({ status, showIcon = true, showLabel = true, size = 'md', className = '' }) => {
    const IconComponent = STATUS_ICONS[status] || STATUS_ICONS.default;
    const color = SUBSCRIPTION_STATUS_COLORS[status] || '#6B7280';
    const label = SUBSCRIPTION_STATUS_LABELS[status] || status;
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };
    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    return (
        <span 
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: `${color}15`, color: color }}
        >
            {showIcon && <IconComponent className={iconSizes[size]} style={{ color: color }} />}
            {showLabel && label}
        </span>
    );
};

SubscriptionStatusBadge.propTypes = {
    status: PropTypes.oneOf(Object.values(SUBSCRIPTION_STATUS)).isRequired,
    showIcon: PropTypes.bool,
    showLabel: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};
export default SubscriptionStatusBadge;
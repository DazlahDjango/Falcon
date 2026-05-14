import React from 'react';
import PropTypes from 'prop-types';
import { 
    FiCheckCircle, 
    FiAlertTriangle, 
    FiXCircle,
    FiClock,
    FiRefreshCw,
    FiZap 
} from 'react-icons/fi';
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS } from '../../config/constants/billingConstants';

const STATUS_ICONS = {
    [SUBSCRIPTION_STATUS.ACTIVE]: FiCheckCircle,
    [SUBSCRIPTION_STATUS.TRIALING]: FiZap,
    [SUBSCRIPTION_STATUS.PAST_DUE]: FiAlertTriangle,
    [SUBSCRIPTION_STATUS.CANCELED]: FiXCircle,
    [SUBSCRIPTION_STATUS.INCOMPLETE]: FiClock,
    [SUBSCRIPTION_STATUS.UNPAID]: FiAlertTriangle,
    [SUBSCRIPTION_STATUS.SUSPENDED]: FiXCircle,
    default: FiClock,
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
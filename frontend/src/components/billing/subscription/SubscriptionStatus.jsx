import React from 'react';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiXCircle, FiMinusCircle } from 'react-icons/fi';
import './subscription.css';

const STATUS_CONFIG = {
    active: { icon: FiCheckCircle, color: '#22c55e', bg: '#dcfce7', label: 'Active' },
    trialing: { icon: FiClock, color: '#3b82f6', bg: '#dbeafe', label: 'Trial' },
    past_due: { icon: FiAlertTriangle, color: '#f59e0b', bg: '#fef3c7', label: 'Past Due' },
    cancelled: { icon: FiXCircle, color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' },
    expired: { icon: FiXCircle, color: '#dc2626', bg: '#fee2e2', label: 'Expired' },
    pending_cancellation: { icon: FiMinusCircle, color: '#f59e0b', bg: '#fef3c7', label: 'Pending Cancellation' }
};

export const SubscriptionStatus = ({ status, size = 'md', showIcon = true, showText = true, showDetails = false, subscription = null }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
    const IconComponent = config.icon;
    const sizeClass = size === 'sm' ? 'status-sm' : size === 'lg' ? 'status-lg' : 'status-md';

    if (showDetails && subscription) {
        return (
            <div className="subscription-status-details">
                <div className="status-main" style={{ background: config.bg, color: config.color }}>
                    {showIcon && <IconComponent />}
                    {showText && <span>{config.label}</span>}
                </div>
                {subscription.is_on_trial && <div className="status-trial-info">Trial ends in {subscription.trial_days_remaining} days</div>}
                {subscription.days_until_expiry <= 7 && subscription.status === 'active' && <div className="status-expiry-warning">Expires in {subscription.days_until_expiry} days</div>}
            </div>
        );
    }

    return (
        <span className={`subscription-status-badge ${sizeClass}`} style={{ background: config.bg, color: config.color }}>
            {showIcon && <IconComponent className="status-icon" />}
            {showText && <span>{config.label}</span>}
        </span>
    );
};

export default SubscriptionStatus;
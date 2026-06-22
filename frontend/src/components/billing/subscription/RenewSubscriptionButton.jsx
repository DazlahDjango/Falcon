import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import './subscription.css';

export const RenewSubscriptionButton = ({ subscriptionId, onSuccess, variant = 'primary' }) => {
    const { renew, loading } = useSubscription();
    const [renewing, setRenewing] = useState(false);

    const handleRenew = async () => {
        if (!window.confirm('Are you sure you want to renew your subscription now? This will charge your saved payment method.')) return;
        setRenewing(true);
        await renew(subscriptionId);
        if (onSuccess) onSuccess();
        setRenewing(false);
    };

    return (
        <button className={`renew-btn ${variant}`} onClick={handleRenew} disabled={renewing}>
            {renewing ? <FiRefreshCw className="spin" /> : <FiRefreshCw />}
            {renewing ? 'Processing...' : 'Renew Now'}
        </button>
    );
};

export default RenewSubscriptionButton;
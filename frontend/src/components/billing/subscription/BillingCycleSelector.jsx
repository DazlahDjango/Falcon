import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import './subscription.css';

export const BillingCycleSelector = ({ subscriptionId, currentInterval, onUpdate }) => {
    const { updateSubscriptionSettings, loading } = useSubscription();
    const [selected, setSelected] = useState(currentInterval);
    const [updating, setUpdating] = useState(false);

    const handleChange = async (interval) => {
        if (interval === selected) return;
        if (!window.confirm(`Are you sure you want to change your billing cycle to ${interval}? This will affect your next billing date.`)) return;
        setUpdating(true);
        await updateSubscriptionSettings(subscriptionId, { billing_interval: interval });
        setSelected(interval);
        if (onUpdate) onUpdate();
        setUpdating(false);
    };

    return (
        <div className="billing-cycle-selector">
            <span className="selector-label">Billing Cycle:</span>
            <div className="selector-buttons">
                <button className={`cycle-btn ${selected === 'monthly' ? 'active' : ''}`} onClick={() => handleChange('monthly')} disabled={updating}>Monthly</button>
                <button className={`cycle-btn ${selected === 'yearly' ? 'active' : ''}`} onClick={() => handleChange('yearly')} disabled={updating}>Yearly</button>
            </div>
            {updating && <FiRefreshCw className="spin" />}
        </div>
    );
};

export default BillingCycleSelector;
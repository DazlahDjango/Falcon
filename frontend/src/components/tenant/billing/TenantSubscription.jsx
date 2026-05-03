// frontend/src/components/tenant/billing/TenantSubscription.jsx
import React from 'react';
import './billing.css';

export const TenantSubscription = ({ subscription, onUpgrade, loading = false }) => {
    const getPlanClass = () => {
        switch (subscription?.plan) {
            case 'trial': return 'tenant-plan-trial';
            case 'basic': return 'tenant-plan-basic';
            case 'professional': return 'tenant-plan-professional';
            case 'enterprise': return 'tenant-plan-enterprise';
            default: return 'tenant-plan-basic';
        }
    };

    const planLimits = {
        trial: { users: 10, storage: '1 GB', apiCalls: '1,000/day', kpis: 50 },
        basic: { users: 50, storage: '5 GB', apiCalls: '5,000/day', kpis: 200 },
        professional: { users: 500, storage: '50 GB', apiCalls: '50,000/day', kpis: 2000 },
        enterprise: { users: 'Unlimited', storage: 'Custom', apiCalls: 'Custom', kpis: 'Unlimited' },
    };

    const limits = planLimits[subscription?.plan] || planLimits.basic;

    const isExpiringSoon = subscription?.expires_at &&
        (new Date(subscription.expires_at) - new Date()) < 7 * 24 * 60 * 60 * 1000;

    return (
        <div className="tenant-subscription-card">
            <div className="tenant-subscription-card-header">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="font-semibold">Current Plan</h3>
                        <span className={`tenant-subscription-plan ${getPlanClass()}`}>
                            {subscription?.plan?.toUpperCase() || 'TRIAL'}
                        </span>
                    </div>
                    {subscription?.plan !== 'enterprise' && (
                        <button
                            onClick={onUpgrade}
                            disabled={loading}
                            className="tenant-upgrade-btn"
                        >
                            Upgrade Plan
                        </button>
                    )}
                </div>
            </div>
            <div className="p-4">
                {isExpiringSoon && (
                    <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-sm text-yellow-700">
                        ⚠️ Your subscription expires on {new Date(subscription.expires_at).toLocaleDateString()}
                    </div>
                )}

                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="tenant-plan-features">
                    <li className="tenant-plan-feature">
                        <span className="tenant-plan-feature-check">✓</span>
                        Up to {limits.users} users
                    </li>
                    <li className="tenant-plan-feature">
                        <span className="tenant-plan-feature-check">✓</span>
                        {limits.storage} storage
                    </li>
                    <li className="tenant-plan-feature">
                        <span className="tenant-plan-feature-check">✓</span>
                        {limits.apiCalls} API calls
                    </li>
                    <li className="tenant-plan-feature">
                        <span className="tenant-plan-feature-check">✓</span>
                        Up to {limits.kpis} KPIs
                    </li>
                </ul>
            </div>
        </div>
    );
};
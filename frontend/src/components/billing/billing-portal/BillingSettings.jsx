import React, { useState } from 'react';
import { useSubscription, useBillingPortal } from '../../../hooks/billing';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';

export const BillingSettings = () => {
    const { subscription, loading, updateAutoRenew, cancelSubscription } = useSubscription();
    const { settings, updateSettings, loading: portalLoading } = useBillingPortal();
    const [updating, setUpdating] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const handleAutoRenewChange = async (value) => {
        setUpdating(true);
        try {
            await updateAutoRenew(value);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;
        
        setCancelling(true);
        try {
            await cancelSubscription(subscription.id);
        } finally {
            setCancelling(false);
        }
    };

    if (loading || portalLoading) {
        return <LoadingSkeleton type="card" />;
    }

    return (
        <div className="billing-settings">
            <div className="billing-settings-section">
                <h3 className="billing-settings-title">Billing Settings</h3>
                
                <div className="billing-settings-item">
                    <div className="billing-settings-item-info">
                        <span className="billing-settings-item-label">Auto-renewal</span>
                        <span className="billing-settings-item-description">
                            Automatically renew your subscription at the end of each billing period
                        </span>
                    </div>
                    <div className="billing-settings-item-control">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={subscription?.auto_renew || false}
                                onChange={(e) => handleAutoRenewChange(e.target.checked)}
                                disabled={updating}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="billing-settings-item">
                    <div className="billing-settings-item-info">
                        <span className="billing-settings-item-label">Billing Email</span>
                        <span className="billing-settings-item-description">
                            Receive invoice notifications and receipts
                        </span>
                    </div>
                    <div className="billing-settings-item-control">
                        <input
                            type="email"
                            className="billing-settings-input"
                            value={settings?.billing_email || ''}
                            placeholder="billing@example.com"
                        />
                    </div>
                </div>
            </div>

            {subscription && subscription.is_active && (
                <div className="billing-settings-section danger">
                    <h3 className="billing-settings-title">Danger Zone</h3>
                    
                    <div className="billing-settings-item">
                        <div className="billing-settings-item-info">
                            <span className="billing-settings-item-label">Cancel Subscription</span>
                            <span className="billing-settings-item-description">
                                Permanently cancel your subscription. You'll lose access to premium features.
                            </span>
                        </div>
                        <div className="billing-settings-item-control">
                            <button
                                className="billing-settings-danger-btn"
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Processing...' : 'Cancel Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingSettings;
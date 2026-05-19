import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { useAdminBilling } from '../../../hooks/billing';

export const TenantSubscriptionManager = ({ tenant, onBack }) => {
    const [loading, setLoading] = useState(false);
    const { bulkUpdateSubscriptions } = useAdminBilling();

    const handleUpdatePlan = async (newPlanId) => {
        setLoading(true);
        try {
            await bulkUpdateSubscriptions([
                { tenant_id: tenant.id, plan_id: newPlanId }
            ]);
            alert('Subscription updated successfully');
        } catch (error) {
            alert('Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel this tenant\'s subscription?')) return;
        
        setLoading(true);
        try {
            await bulkUpdateSubscriptions([
                { tenant_id: tenant.id, status: 'cancelled' }
            ]);
            alert('Subscription cancelled');
        } catch (error) {
            alert('Failed to cancel subscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tenant-subscription-manager">
            <div className="manager-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h3>Manage Subscription: {tenant.id}</h3>
            </div>

            <div className="manager-content">
                <div className="subscription-info">
                    <h4>Current Subscription</h4>
                    <div className="info-row">
                        <span>Status:</span>
                        <StatusBadge status={tenant.subscriptions?.[0]?.status || 'inactive'} />
                    </div>
                    <div className="info-row">
                        <span>Plan:</span>
                        <strong>{tenant.subscriptions?.[0]?.plan_name || 'No active plan'}</strong>
                    </div>
                    <div className="info-row">
                        <span>Amount:</span>
                        <PriceDisplay amount={tenant.subscriptions?.[0]?.amount || 0} />
                    </div>
                    <div className="info-row">
                        <span>Renews:</span>
                        <span>{tenant.subscriptions?.[0]?.current_period_end || 'N/A'}</span>
                    </div>
                </div>

                <div className="billing-summary">
                    <h4>Billing Summary</h4>
                    <div className="summary-row">
                        <span>Total Spent:</span>
                        <strong>KES {((tenant.total_spent || 0) / 100).toLocaleString()}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Outstanding:</span>
                        <strong className="text-warning">
                            KES {((tenant.invoices?.total_outstanding || 0) / 100).toLocaleString()}
                        </strong>
                    </div>
                    <div className="summary-row">
                        <span>Total Invoices:</span>
                        <span>{tenant.invoices?.total || 0}</span>
                    </div>
                    <div className="summary-row">
                        <span>Paid Invoices:</span>
                        <span>{tenant.invoices?.paid || 0}</span>
                    </div>
                </div>

                <div className="admin-actions">
                    <h4>Admin Actions</h4>
                    <div className="actions-buttons">
                        <button 
                            className="action-btn update-plan"
                            onClick={() => handleUpdatePlan('professional')}
                            disabled={loading}
                        >
                            Set Professional Plan
                        </button>
                        <button 
                            className="action-btn cancel-sub"
                            onClick={handleCancelSubscription}
                            disabled={loading}
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

TenantSubscriptionManager.propTypes = {
    tenant: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default TenantSubscriptionManager;
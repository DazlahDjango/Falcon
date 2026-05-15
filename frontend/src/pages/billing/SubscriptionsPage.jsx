import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../../hooks/billing';
import { SubscriptionCard } from '../../components/billing/subscription/SubscriptionCard';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';

export const SubscriptionsPage = () => {
    const navigate = useNavigate();
    const { subscriptions, loading, error, stats } = useSubscriptions();

    if (loading) {
        return (
            <BillingLayout title="Subscriptions">
                <LoadingSkeleton type="list" count={3} />
            </BillingLayout>
        );
    }

    if (error) {
        return (
            <BillingLayout title="Subscriptions">
                <EmptyState 
                    title="Error loading subscriptions"
                    message={error}
                    icon="⚠️"
                />
            </BillingLayout>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <BillingLayout title="Subscriptions">
                <EmptyState 
                    title="No subscriptions found"
                    message="You don't have any active subscriptions"
                    icon="🔄"
                    action={
                        <button onClick={() => navigate('/plans')} className="btn-primary">
                            View Plans
                        </button>
                    }
                />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout title="Subscriptions">
            {stats && (
                <div className="subscriptions-stats">
                    <div className="stat-card">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Trialing</span>
                        <span className="stat-value">{stats.trialing}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Expiring Soon</span>
                        <span className="stat-value warning">{stats.expiringSoon || 0}</span>
                    </div>
                </div>
            )}
            
            <div className="subscriptions-list">
                {subscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
            </div>
        </BillingLayout>
    );
};

export default SubscriptionsPage;
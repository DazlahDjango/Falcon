import React from 'react';
import { useSubscriptions } from '../../../hooks/billing';
import { SubscriptionCard } from '../../../components/billing/subscription/SubscriptionCard';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../../components/billing/shared/LoadingSkeleton';

export const AdminSubscriptionsPage = () => {
    const { subscriptions, loading } = useSubscriptions();

    if (loading) {
        return (
            <BillingLayout title="All Subscriptions">
                <LoadingSkeleton type="list" count={5} />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout 
            title="All Subscriptions"
            subtitle="View all tenant subscriptions"
        >
            <div className="subscriptions-list">
                {subscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
            </div>
        </BillingLayout>
    );
};

export default AdminSubscriptionsPage;
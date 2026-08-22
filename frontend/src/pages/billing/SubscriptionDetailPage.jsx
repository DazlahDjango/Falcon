import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/billing';
import { SubscriptionDetails } from '../../components/billing/subscription/SubscriptionDetails';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';

export const SubscriptionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { subscription, loading, error, fetchById } = useSubscription();

    React.useEffect(() => {
        if (id) {
            fetchById(id);
        }
    }, [id, fetchById]);

    if (loading) {
        return (
            <BillingLayout title="Subscription Details">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    if (error || !subscription) {
        return (
            <BillingLayout title="Subscription Not Found">
                <EmptyState 
                    title="Subscription not found"
                    message="The subscription you're looking for doesn't exist"
                    icon="🔍"
                    action={
                        <button onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTIONS)} className="btn-primary">
                            Back to Subscriptions
                        </button>
                    }
                />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout title="Subscription Details">
            <SubscriptionDetails 
                subscription={subscription}
                onRefresh={() => fetchById(id)}
            />
        </BillingLayout>
    );
};

export default SubscriptionDetailPage;
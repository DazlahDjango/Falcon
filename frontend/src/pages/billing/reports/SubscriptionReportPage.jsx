import React from 'react';
import { useBillingAnalytics } from '../../../hooks/billing';
import { SubscriptionTrends } from '../../../components/billing/analytics/SubscriptionTrends';
import { MRRCard } from '../../../components/billing/analytics/MRRCard';
import { ChurnRate } from '../../../components/billing/analytics/ChurnRate';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../../components/billing/shared/LoadingSkeleton';

export const SubscriptionReportPage = () => {
    const { subscriptions, loading, fetchSubscriptionAnalytics } = useBillingAnalytics();

    React.useEffect(() => {
        fetchSubscriptionAnalytics();
    }, []);

    if (loading) {
        return (
            <BillingLayout title="Subscription Report">
                <LoadingSkeleton type="card" count={3} />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout 
            title="Subscription Report"
            subtitle="Track your subscription metrics"
        >
            <div className="report-grid">
                <MRRCard mrr={subscriptions?.total_mrr || 0} loading={loading} />
                <ChurnRate 
                    churnRate={subscriptions?.churn_rate || 0}
                    newCustomers={subscriptions?.new_subscriptions}
                    lostCustomers={subscriptions?.lost_subscriptions}
                    loading={loading}
                />
            </div>

            <SubscriptionTrends data={subscriptions} loading={loading} />

            <div className="report-stats">
                <div className="stat-card">
                    <span>Active Subscriptions</span>
                    <strong>{subscriptions?.total_active || 0}</strong>
                </div>
                <div className="stat-card">
                    <span>Trialing</span>
                    <strong>{subscriptions?.total_trialing || 0}</strong>
                </div>
                <div className="stat-card">
                    <span>Cancelled (30d)</span>
                    <strong>{subscriptions?.cancelled_last_30d || 0}</strong>
                </div>
                <div className="stat-card">
                    <span>Average Lifetime</span>
                    <strong>{subscriptions?.avg_lifetime_days || 0} days</strong>
                </div>
            </div>
        </BillingLayout>
    );
};

export default SubscriptionReportPage;
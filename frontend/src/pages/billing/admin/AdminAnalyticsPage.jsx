import React from 'react';
import { useBillingAnalytics } from '../../../hooks/billing';
import { RevenueChart } from '../../../components/billing/analytics/RevenueChart';
import { SubscriptionTrends } from '../../../components/billing/analytics/SubscriptionTrends';
import { MRRCard } from '../../../components/billing/analytics/MRRCard';
import { ChurnRate } from '../../../components/billing/analytics/ChurnRate';
import { RevenueBreakdown } from '../../../components/billing/analytics/RevenueBreakdown';
import { BillingMetricsCards } from '../../../components/billing/analytics/BillingMetricsCards';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../../components/billing/shared/LoadingSkeleton';

export const AdminAnalyticsPage = () => {
    const { 
        revenue, 
        subscriptions, 
        summary,
        loading,
        fetchRevenue,
        fetchSubscriptionAnalytics,
    } = useBillingAnalytics();

    React.useEffect(() => {
        fetchRevenue({ days: 90 });
        fetchSubscriptionAnalytics();
    }, []);

    if (loading) {
        return (
            <BillingLayout title="Billing Analytics">
                <LoadingSkeleton type="card" count={4} />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout 
            title="Billing Analytics"
            subtitle="Overview of your billing performance"
        >
            <BillingMetricsCards metrics={summary} loading={loading} />

            <div className="analytics-grid">
                <div className="analytics-card full-width">
                    <h4>Revenue Trend (90 days)</h4>
                    <RevenueChart data={revenue} loading={loading} type="line" />
                </div>
            </div>

            <div className="analytics-grid two-columns">
                <div className="analytics-card">
                    <h4>Subscription Distribution</h4>
                    <SubscriptionTrends data={subscriptions} loading={loading} />
                </div>
                <div className="analytics-card">
                    <h4>Revenue by Plan</h4>
                    <RevenueBreakdown data={revenue} loading={loading} />
                </div>
            </div>

            <div className="analytics-grid two-columns">
                <div className="analytics-card">
                    <MRRCard mrr={subscriptions?.total_mrr || 0} loading={loading} />
                </div>
                <div className="analytics-card">
                    <ChurnRate 
                        churnRate={subscriptions?.churn_rate || 0}
                        loading={loading}
                    />
                </div>
            </div>
        </BillingLayout>
    );
};

export default AdminAnalyticsPage;
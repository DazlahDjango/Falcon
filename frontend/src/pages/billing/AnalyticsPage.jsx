import React, { useEffect } from 'react';
import { BillingShell } from '../../components/billing/common/BillingShell';
import { BillingMetricsCards } from '../../components/billing/analytics/BillingMetricsCards';
import { MRRCard } from '../../components/billing/analytics/MRRCard';
import { RevenueChart } from '../../components/billing/analytics/RevenueChart';
import { RevenueBreakdown } from '../../components/billing/analytics/RevenueBreakdown';
import { SubscriptionTrends } from '../../components/billing/analytics/SubscriptionTrends';
import { ChurnRate } from '../../components/billing/analytics/ChurnRate';
import { InvoiceAnalytics } from '../../components/billing/analytics/InvoiceAnalytics';
import { TaxReport } from '../../components/billing/analytics/TaxReport';
import { useBillingAnalytics } from '../../hooks/billing/useBillingAnalytics';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

const AnalyticsPage = () => {
    const {
        summary, revenue, subscriptions, loading,
        fetchSummary, fetchRevenue, fetchSubscriptions,
        mrr, totalRevenue, activeSubscriptions, successRate
    } = useBillingAnalytics({ autoFetch: false });

    useEffect(() => {
        fetchSummary();
        fetchRevenue({});
        fetchSubscriptions();
    }, []);

    if (loading) return <LoadingSkeleton type="card" count={4} />;

    const metrics = {
        mrr: mrr || subscriptions?.monthly_recurring_revenue || 0,
        mrrChange: subscriptions?.mrr_change || 0,
        activeSubscriptions: activeSubscriptions || subscriptions?.total_active || 0,
        activeChange: subscriptions?.active_change || 0,
        totalRevenue: totalRevenue || summary?.total_revenue || 0,
        revenueChange: revenue?.revenue_change || 0,
        successRate: successRate || revenue?.success_rate || 0,
        successRateChange: revenue?.success_rate_change || 0,
        arpu: summary?.arpu || 0,
        arpuChange: summary?.arpu_change || 0,
        ltv: summary?.ltv || 0,
        ltvChange: summary?.ltv_change || 0
    };

    return (
        <BillingShell title="Analytics Dashboard" subtitle="Monitor your billing performance and metrics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <BillingMetricsCards metrics={metrics} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <MRRCard currentMRR={subscriptions?.total_mrr || 0} data={revenue?.breakdown || []} />
                    <ChurnRate churnRate={subscriptions?.churn_rate || 0} />
                </div>
                <RevenueChart data={revenue?.breakdown || []} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <RevenueBreakdown data={subscriptions?.by_plan_type || []} title="Revenue by Plan" />
                    <SubscriptionTrends data={subscriptions?.trends || []} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <InvoiceAnalytics data={summary} />
                    <TaxReport data={summary?.tax_breakdown || []} totalTax={summary?.total_tax || 0} />
                </div>
            </div>
        </BillingShell>
    );
};

export default AnalyticsPage;
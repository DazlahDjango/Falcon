import React, { useState } from 'react';
import { useBillingAnalytics } from '../../../hooks/billing';
import { RevenueChart } from '../../../components/billing/analytics/RevenueChart';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../../components/billing/shared/LoadingSkeleton';

export const RevenueReportPage = () => {
    const [period, setPeriod] = useState('monthly');
    const [days, setDays] = useState(90);
    const { revenue, loading, fetchRevenue } = useBillingAnalytics();

    React.useEffect(() => {
        fetchRevenue({ days, period });
    }, [days, period]);

    const handleExport = () => {
        // Export functionality
        console.log('Export revenue report');
    };

    if (loading) {
        return (
            <BillingLayout title="Revenue Report">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout 
            title="Revenue Report"
            subtitle="Track your revenue over time"
            actions={
                <button onClick={handleExport} className="btn-secondary">
                    Export Report
                </button>
            }
        >
            <div className="report-controls">
                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={180}>Last 6 months</option>
                    <option value={365}>Last year</option>
                </select>
            </div>

            <RevenueChart data={revenue} loading={loading} type="bar" height={400} />

            <div className="report-summary">
                <div className="summary-item">
                    <span>Total Revenue</span>
                    <strong>KES {((revenue?.total_revenue || 0) / 100).toLocaleString()}</strong>
                </div>
                <div className="summary-item">
                    <span>Total Transactions</span>
                    <strong>{revenue?.total_transactions || 0}</strong>
                </div>
                <div className="summary-item">
                    <span>Success Rate</span>
                    <strong>{revenue?.success_rate || 0}%</strong>
                </div>
            </div>
        </BillingLayout>
    );
};

export default RevenueReportPage;
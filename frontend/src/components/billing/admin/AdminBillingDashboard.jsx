import React, { useState, useCallback, useEffect } from 'react';
import { FiUsers, FiCreditCard, FiFileText, FiActivity, FiRefreshCw, FiDownload, FiCalendar, FiTrendingUp, FiDollarSign, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useAdminBilling } from '../../../hooks/billing/useAdminBilling';
import { useBillingAnalytics } from '../../../hooks/billing/useBillingAnalytics';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { TenantsList } from './TenantsList';
import { RevenueChart } from './RevenueChart';
import { FailedTransactionsMonitor } from './FailedTransactionsMonitor';
import './admin.css';

export const AdminBillingDashboard = () => {
    const { permissions } = useBillingPermissions();
    const { getRevenueReport, getSubscriptionReport, loading, clearAllReports } = useAdminBilling();
    const { revenue: revenueAnalytics, fetchRevenueReport, fetchSubscriptionAnalytics, subscriptions: subscriptionAnalytics } = useBillingAnalytics({ autoFetch: false });
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    useEffect(() => {
        if (permissions.canAccessAdminPanel) {
            fetchReports();
        }
    }, [selectedPeriod, dateRange]);

    const fetchReports = useCallback(async () => {
        setRefreshing(true);
        const endDate = new Date();
        let startDate = new Date();
        switch (selectedPeriod) {
            case 'week': startDate.setDate(endDate.getDate() - 7); break;
            case 'month': startDate.setMonth(endDate.getMonth() - 1); break;
            case 'quarter': startDate.setMonth(endDate.getMonth() - 3); break;
            case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
            default: startDate.setMonth(endDate.getMonth() - 1);
        }
        await Promise.all([
            fetchRevenueReport({ start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0] }),
            fetchSubscriptionAnalytics(),
            getRevenueReport(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
            getSubscriptionReport(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
        ]);
        setRefreshing(false);
    }, [selectedPeriod, dateRange, fetchRevenueReport, fetchSubscriptionAnalytics, getRevenueReport, getSubscriptionReport]);

    if (!permissions.canAccessAdminPanel) {
        return <EmptyState type="default" title="Access Denied" message="You don't have permission to access the admin billing dashboard." />;
    }

    const stats = [
        { label: 'Total Revenue', value: revenueAnalytics?.total_revenue || 0, icon: FiDollarSign, color: '#3b82f6', trend: '+12%' },
        { label: 'Active Subscriptions', value: subscriptionAnalytics?.total_active || 0, icon: FiUsers, color: '#22c55e', trend: '+5%' },
        { label: 'Total Transactions', value: revenueAnalytics?.total_transactions || 0, icon: FiActivity, color: '#8b5cf6', trend: '+8%' },
        { label: 'Success Rate', value: `${revenueAnalytics?.success_rate || 0}%`, icon: FiCheckCircle, color: '#f59e0b', trend: '+2%' },
    ];

    return (
        <BillingShell title="Admin Billing Dashboard" subtitle="Monitor and manage all billing activities across tenants">
            <div className="admin-dashboard">
                <div className="admin-header-actions">
                    <div className="admin-period-selector">
                        <button className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`} onClick={() => setSelectedPeriod('week')}>Week</button>
                        <button className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`} onClick={() => setSelectedPeriod('month')}>Month</button>
                        <button className={`period-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`} onClick={() => setSelectedPeriod('quarter')}>Quarter</button>
                        <button className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`} onClick={() => setSelectedPeriod('year')}>Year</button>
                    </div>
                    <button className="admin-refresh-btn" onClick={fetchReports} disabled={refreshing}>
                        <FiRefreshCw className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                <div className="admin-stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="admin-stat-card" style={{ borderTopColor: stat.color }}>
                            <div className="admin-stat-header">
                                <span className="admin-stat-label">{stat.label}</span>
                                <stat.icon className="admin-stat-icon" style={{ color: stat.color }} />
                            </div>
                            <div className="admin-stat-value">{typeof stat.value === 'number' && stat.label.includes('Revenue') ? <CurrencyFormatter amount={stat.value} /> : stat.value}</div>
                            <div className="admin-stat-trend positive">{stat.trend} from last period</div>
                        </div>
                    ))}
                </div>

                <div className="admin-charts-grid">
                    <RevenueChart data={revenueAnalytics?.breakdown || []} loading={loading} />
                    <div className="admin-metrics-card">
                        <BillingCard title="Subscription Metrics" icon={<FiUsers />}>
                            <div className="metrics-list">
                                <div className="metric-item"><span className="metric-label">Active</span><span className="metric-value">{subscriptionAnalytics?.total_active || 0}</span></div>
                                <div className="metric-item"><span className="metric-label">Trialing</span><span className="metric-value">{subscriptionAnalytics?.total_trialing || 0}</span></div>
                                <div className="metric-item"><span className="metric-label">Past Due</span><span className="metric-value warning">{subscriptionAnalytics?.total_past_due || 0}</span></div>
                                <div className="metric-item"><span className="metric-label">Cancelled</span><span className="metric-value">{subscriptionAnalytics?.total_cancelled || 0}</span></div>
                                <div className="metric-item"><span className="metric-label">Expired</span><span className="metric-value">{subscriptionAnalytics?.total_expired || 0}</span></div>
                                <div className="metric-item metric-total"><span className="metric-label">Total MRR</span><span className="metric-value highlight"><CurrencyFormatter amount={subscriptionAnalytics?.total_mrr || 0} /></span></div>
                            </div>
                        </BillingCard>
                    </div>
                </div>

                <div className="admin-tables-grid">
                    <TenantsList />
                    <FailedTransactionsMonitor />
                </div>
            </div>
        </BillingShell>
    );
};

export default AdminBillingDashboard;
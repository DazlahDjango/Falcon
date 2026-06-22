import React, { useEffect, useState } from 'react';
import { FiUsers, FiBarChart2, FiDatabase, FiActivity, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useUsage } from '../../../hooks/billing/useUsage';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import './usage.css';

export const UsageDashboard = () => {
    const { permissions } = useBillingPermissions();
    const { subscription, loading: subLoading } = useSubscription({ autoFetch: true });
    const { summary, limits, alerts, loading, fetchSummary, fetchLimits, usersUsage, kpisUsage, apiCallsUsage, storageUsage, daysRemaining } = useUsage({ autoFetch: true });

    if (!permissions.canViewBilling) return <EmptyState type="default" title="Access Denied" message="You don't have permission to view usage." />;
    if (loading || subLoading) return <LoadingSkeleton type="card" count={3} />;
    if (!subscription) return <EmptyState type="subscriptions" />;

    const usageItems = [
        { key: 'users', label: 'Users', icon: FiUsers, current: usersUsage.current, limit: usersUsage.limit, percentage: usersUsage.percentage, color: '#3b82f6' },
        { key: 'kpis', label: 'KPIs', icon: FiBarChart2, current: kpisUsage.current, limit: kpisUsage.limit, percentage: kpisUsage.percentage, color: '#8b5cf6' },
        { key: 'api_calls', label: 'API Calls', icon: FiActivity, current: apiCallsUsage.current, limit: apiCallsUsage.limit, percentage: apiCallsUsage.percentage, color: '#22c55e' },
        { key: 'storage', label: 'Storage (MB)', icon: FiDatabase, current: storageUsage.current, limit: storageUsage.limit, percentage: storageUsage.percentage, color: '#f59e0b' }
    ];

    const getStatusColor = (percentage) => {
        if (percentage >= 110) return '#dc2626';
        if (percentage >= 100) return '#f59e0b';
        if (percentage >= 80) return '#f59e0b';
        return '#22c55e';
    };

    const getStatusText = (percentage) => {
        if (percentage >= 110) return 'Hard Limit Exceeded';
        if (percentage >= 100) return 'Soft Limit Reached';
        if (percentage >= 80) return 'Approaching Limit';
        return 'Healthy';
    };

    return (
        <BillingShell title="Usage Dashboard" subtitle="Monitor your resource consumption against plan limits">
            <div className="usage-container">
                <div className="usage-header-info">
                    <div className="plan-info"><span className="label">Current Plan:</span><span className="value">{subscription.plan?.name}</span></div>
                    <div className="period-info"><span className="label">Billing Period:</span><span className="value">{new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}</span></div>
                    <div className="days-info"><span className="label">Days Remaining:</span><span className={`value ${daysRemaining <= 7 ? 'warning' : ''}`}>{daysRemaining} days</span></div>
                </div>

                <div className="usage-grid">
                    {usageItems.map(item => {
                        const isUnlimited = item.limit === -1;
                        const percentage = isUnlimited ? 0 : item.percentage;
                        const statusColor = getStatusColor(percentage);
                        const statusText = getStatusText(percentage);
                        return (<div key={item.key} className="usage-card" style={{ borderTopColor: item.color }}>
                            <div className="usage-card-header"><div className="usage-icon" style={{ background: `${item.color}15`, color: item.color }}><item.icon /></div><div className="usage-title"><h3>{item.label}</h3><span className="usage-limit">{isUnlimited ? 'Unlimited' : `Limit: ${item.limit.toLocaleString()}`}</span></div></div>
                            <div className="usage-value">{isUnlimited ? '∞' : item.current.toLocaleString()} / {isUnlimited ? '∞' : item.limit.toLocaleString()}</div>
                            {!isUnlimited && (<><div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: statusColor }}></div></div><div className="usage-stats"><span className="usage-percentage" style={{ color: statusColor }}>{percentage.toFixed(1)}% used</span><span className="usage-status" style={{ color: statusColor }}>{statusText}</span></div></>)}
                            {percentage >= 100 && (<div className="usage-warning"><FiAlertCircle /> You have {percentage >= 110 ? 'exceeded' : 'reached'} your {item.label} limit. {percentage >= 110 ? 'Please upgrade to continue.' : 'Consider upgrading for more capacity.'}</div>)}
                        </div>);
                    })}
                </div>

                {alerts.length > 0 && (<div className="usage-alerts"><h4><FiAlertCircle /> Recent Alerts</h4>{alerts.slice(-5).map((alert, idx) => (<div key={idx} className="alert-item"><span className={`alert-type ${alert.type}`}>{alert.type === 'hard' ? 'Hard Limit' : 'Soft Limit'}</span><span>{alert.message}</span><span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span></div>))}</div>)}
            </div>
        </BillingShell>
    );
};

export default UsageDashboard;
import React, { useState, useCallback } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiCalendar, FiAlertCircle, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { useTransactions } from '../../../hooks/billing/useTransactions';
import { useInvoices } from '../../../hooks/billing/useInvoices';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import './operations.css';

export const BillingOperationsConsole = () => {
    const { permissions } = useBillingPermissions();
    const { subscription, loading: subLoading, fetchCurrent } = useSubscription({ autoFetch: true });
    const { transactions, loading: txLoading, fetchAll: fetchTransactions } = useTransactions({ autoFetch: true });
    const { invoices, loading: invLoading, fetchAll: fetchInvoices } = useInvoices({ autoFetch: true });
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchCurrent(), fetchTransactions({}), fetchInvoices({})]);
        setRefreshing(false);
    }, [fetchCurrent, fetchTransactions, fetchInvoices]);

    const handleExport = useCallback(async () => {
        const data = { subscription, transactions, invoices };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [subscription, transactions, invoices]);

    const isLoading = subLoading || txLoading || invLoading || refreshing;

    if (isLoading) return <LoadingSkeleton type="card" count={4} />;

    if (!permissions.canViewBilling) {
        return <EmptyState type="default" title="Access Denied" message="You don't have permission to access billing operations." />;
    }

    const hasActiveSubscription = subscription?.is_active_status?.is_active;
    const isOnTrial = subscription?.is_active_status?.is_on_trial;
    const daysRemaining = subscription?.is_active_status?.days_until_expiry || 0;
    const recentTransactions = transactions?.slice(0, 5) || [];
    const pendingInvoices = invoices?.filter(i => i.status === 'pending') || [];
    const overdueInvoices = invoices?.filter(i => i.status === 'overdue') || [];

    return (
        <BillingShell title="Billing Operations Console" subtitle="Manage and monitor your billing activities">
            <div className="operations-console">
                <div className="operations-header-actions">
                    <button className="operations-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                        <FiRefreshCw className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="operations-export-btn" onClick={handleExport}>
                        <FiDownload /> Export Data
                    </button>
                </div>

                <div className="operations-grid">
                    <BillingCard title="Subscription Status" icon={<FiAlertCircle />} className="operations-card">
                        <div className="subscription-status-card">
                            <div className="subscription-status-badge">
                                <StatusBadge type="subscription" status={subscription?.status} size="lg" />
                            </div>
                            <div className="subscription-plan-info">
                                <span className="plan-name">{subscription?.plan?.name || 'No Active Plan'}</span>
                                <span className="plan-price">
                                    <CurrencyFormatter amount={subscription?.amount || 0} currency={subscription?.currency || 'KES'} />
                                    <span className="plan-interval">/{subscription?.billing_interval || 'month'}</span>
                                </span>
                            </div>
                            {hasActiveSubscription && (
                                <div className="subscription-period">
                                    {isOnTrial ? (
                                        <div className="trial-warning"><FiClock /> Trial ends in {subscription?.is_active_status?.trial_days_remaining} days</div>
                                    ) : daysRemaining <= 7 ? (
                                        <div className="expiry-warning"><FiAlertCircle /> Expires in {daysRemaining} days</div>
                                    ) : (
                                        <div className="expiry-info">Next billing: {new Date(subscription?.current_period_end).toLocaleDateString()}</div>
                                    )}
                                </div>
                            )}
                            {subscription?.cancel_at_period_end && <div className="cancellation-notice">Subscription will cancel at period end</div>}
                            {subscription?.status === 'past_due' && <div className="past-due-notice"><FiAlertCircle /> Payment past due. Please update your payment method.</div>}
                        </div>
                    </BillingCard>

                    <BillingCard title="Financial Summary" icon={<FiCheckCircle />} className="operations-card">
                        <div className="financial-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Spent (Lifetime)</span>
                                <span className="summary-value"><CurrencyFormatter amount={transactions?.reduce((sum, t) => t.status === 'success' ? sum + t.total_amount : sum, 0)} /></span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Pending Invoices</span>
                                <span className="summary-value pending">{pendingInvoices.length}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Overdue Invoices</span>
                                <span className={`summary-value ${overdueInvoices.length > 0 ? 'overdue' : ''}`}>{overdueInvoices.length}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Auto-Renewal</span>
                                <span className={`summary-value ${subscription?.auto_renew ? 'active' : 'inactive'}`}>{subscription?.auto_renew ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        </div>
                    </BillingCard>

                    <BillingCard title="Recent Transactions" icon={<FiClock />} className="operations-card">
                        {recentTransactions.length === 0 ? (
                            <EmptyState type="transactions" title="No transactions yet" />
                        ) : (
                            <div className="transactions-list">
                                {recentTransactions.map(tx => (
                                    <div key={tx.id} className="transaction-item">
                                        <div className="transaction-info">
                                            <span className="transaction-reference">{tx.reference?.slice(-8)}</span>
                                            <StatusBadge type="transaction" status={tx.status} size="sm" />
                                        </div>
                                        <div className="transaction-amount">
                                            <CurrencyFormatter amount={tx.total_amount} currency={tx.currency} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </BillingCard>

                    <BillingCard title="Quick Actions" icon={<FiFilter />} className="operations-card">
                        <div className="quick-actions">
                            <button className="quick-action-btn" onClick={() => window.location.href = '/billing/subscriptions/upgrade'}>Upgrade Plan</button>
                            <button className="quick-action-btn" onClick={() => window.location.href = '/billing/payment-methods'}>Manage Payment Methods</button>
                            <button className="quick-action-btn" onClick={() => window.location.href = '/billing/invoices'}>View All Invoices</button>
                            <button className="quick-action-btn danger" onClick={() => window.location.href = '/billing/subscriptions/cancel'}>Cancel Subscription</button>
                        </div>
                    </BillingCard>
                </div>
            </div>
        </BillingShell>
    );
};

export default BillingOperationsConsole;
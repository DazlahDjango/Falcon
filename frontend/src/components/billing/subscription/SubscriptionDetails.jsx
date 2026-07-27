import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiCalendar, FiDollarSign, FiUsers, FiActivity, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { SubscriptionStatus } from './SubscriptionStatus';
import { BillingCycleSelector } from './BillingCycleSelector';
import { RenewSubscriptionButton } from './RenewSubscriptionButton';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { UpgradeDowngradeModal } from './UpgradeDowngradeModal';
import { TrialBanner } from './TrialBanner';
import './subscription.css';

export const SubscriptionDetails = () => {
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { subscription, usage, loading, fetchCurrent, fetchUsage, isActive, isOnTrial, trialDaysRemaining, daysUntilExpiry, planType, autoRenew, cancelAtPeriodEnd } = useSubscription({ autoFetch: true });
    const [refreshing, setRefreshing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeDirection, setUpgradeDirection] = useState('upgrade');

    useEffect(() => { if (subscription?.id) fetchUsage(subscription.id); }, [subscription?.id, fetchUsage]);

    const handleRefresh = async () => { setRefreshing(true); await fetchCurrent(); if (subscription?.id) await fetchUsage(subscription.id); setRefreshing(false); };

    if (loading && !subscription) return <LoadingSkeleton type="card" count={2} />;
    if (!subscription) return <EmptyState type="subscriptions" title="No Active Subscription" message="You don't have an active subscription. Browse our plans to get started." actionText="View Plans" onAction={() => navigate('/billing/plans')} />;

    const canManage = permissions.canManageSubscriptions;
    const canUpgrade = canManage && (planType === 'basic' || planType === 'professional');
    const canDowngrade = canManage && (planType === 'professional' || planType === 'enterprise');
    const canCancel = canManage && isActive && !cancelAtPeriodEnd;

    return (
        <BillingShell title="Subscription Details" subtitle="Manage your current subscription plan and billing settings" breadcrumb={true}>
            <div className="subscription-detail-container">
                <div className="subscription-detail-actions">
                    <button className="subscription-back-btn" onClick={() => navigate('/billing/subscriptions')}><FiArrowLeft /> Back</button>
                    <button className="subscription-refresh-btn" onClick={handleRefresh} disabled={refreshing}><FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh</button>
                </div>

                {isOnTrial && <TrialBanner daysRemaining={trialDaysRemaining} onUpgrade={() => { setUpgradeDirection('upgrade'); setShowUpgradeModal(true); }} />}

                <div className="subscription-grid">
                    <div className="subscription-main-card">
                        <BillingCard title="Current Plan" icon={<FiActivity />}>
                            <div className="plan-details">
                                <div className="plan-header">
                                    <h2 className="plan-name">{subscription.plan?.name}</h2>
                                    <StatusBadge type="subscription" status={subscription.status} size="lg" />
                                </div>
                                <div className="plan-pricing">
                                    <CurrencyFormatter amount={subscription.amount} currency={subscription.currency} />
                                    <span className="plan-interval">/{subscription.billing_interval}</span>
                                </div>
                                <div className="plan-features-preview">
                                    <strong>Key Features:</strong>
                                    <ul>{subscription.plan?.features_list_display?.slice(0, 5).map((f, i) => (<li key={i}>{f}</li>))}</ul>
                                </div>
                            </div>
                        </BillingCard>

                        <BillingCard title="Billing Information" icon={<FiCalendar />}>
                            <div className="billing-info">
                                <div className="info-row"><span className="label">Current Period</span><span className="value">{new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}</span></div>
                                <div className="info-row"><span className="label">Days Remaining</span><span className={`value ${daysUntilExpiry <= 7 ? 'warning' : ''}`}>{daysUntilExpiry} days</span></div>
                                <div className="info-row"><span className="label">Auto-Renewal</span><span className="value">{autoRenew ? <FiCheckCircle className="success" /> : <FiXCircle className="danger" />} {autoRenew ? 'Enabled' : 'Disabled'}</span></div>
                                {cancelAtPeriodEnd && <div className="info-row"><span className="label">Status</span><span className="value warning">Cancels at period end</span></div>}
                            </div>
                            <div className="billing-actions">
                                {canManage && <BillingCycleSelector subscriptionId={subscription.id} currentInterval={subscription.billing_interval} onUpdate={handleRefresh} />}
                                {autoRenew && canManage && <RenewSubscriptionButton subscriptionId={subscription.id} onSuccess={handleRefresh} />}
                            </div>
                        </BillingCard>
                    </div>

                    <div className="subscription-sidebar">
                        <BillingCard title="Usage Summary" icon={<FiUsers />}>
                            <div className="usage-stats">
                                <div className="usage-item"><span className="usage-label">Users</span><span className="usage-value">{usage?.users?.current || 0} / {usage?.users?.limit === -1 ? '∞' : usage?.users?.limit}</span><div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${Math.min(usage?.users?.percentage || 0, 100)}%` }}></div></div></div>
                                <div className="usage-item"><span className="usage-label">KPIs</span><span className="usage-value">{usage?.kpis?.current || 0} / {usage?.kpis?.limit === -1 ? '∞' : usage?.kpis?.limit}</span><div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${Math.min(usage?.kpis?.percentage || 0, 100)}%` }}></div></div></div>
                                <div className="usage-item"><span className="usage-label">API Calls</span><span className="usage-value">{usage?.api_calls?.current || 0} / {usage?.api_calls?.limit === -1 ? '∞' : usage?.api_calls?.limit}</span><div className="usage-bar"><div className="usage-bar-fill" style={{ width: `${Math.min(usage?.api_calls?.percentage || 0, 100)}%` }}></div></div></div>
                            </div>
                        </BillingCard>

                        <BillingCard title="Quick Actions" icon={<FiCreditCard />}>
                            <div className="quick-actions">
                                {canUpgrade && <button className="quick-action-btn primary" onClick={() => { setUpgradeDirection('upgrade'); setShowUpgradeModal(true); }}>Upgrade Plan</button>}
                                {canDowngrade && <button className="quick-action-btn secondary" onClick={() => { setUpgradeDirection('downgrade'); setShowUpgradeModal(true); }}>Downgrade Plan</button>}
                                {canCancel && <button className="quick-action-btn danger" onClick={() => setShowCancelModal(true)}>Cancel Subscription</button>}
                                <button className="quick-action-btn outline" onClick={() => navigate('/billing/invoices')}>View Invoices</button>
                                <button className="quick-action-btn outline" onClick={() => navigate('/billing/transactions')}>View Transactions</button>
                            </div>
                        </BillingCard>
                    </div>
                </div>

                {showCancelModal && <CancelSubscriptionModal subscription={subscription} onClose={() => setShowCancelModal(false)} onSuccess={handleRefresh} />}
                {showUpgradeModal && <UpgradeDowngradeModal subscription={subscription} direction={upgradeDirection} onClose={() => setShowUpgradeModal(false)} onSuccess={handleRefresh} />}
            </div>
        </BillingShell>
    );
};

export default SubscriptionDetails;
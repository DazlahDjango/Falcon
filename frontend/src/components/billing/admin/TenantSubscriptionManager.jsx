import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiRefreshCw, FiCreditCard, FiCalendar, FiDollarSign, FiAlertCircle, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useAdminBilling } from '../../../hooks/billing/useAdminBilling';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { useEnterprise } from '../../../hooks/billing/useEnterprise';
import './admin.css';

export const TenantSubscriptionManager = ({ tenant, onClose }) => {
    const { getTenantSubscriptions, getTenantInvoices, getTenantTransactions, tenantData, loading } = useAdminBilling();
    const { cancelSubscription, renewSubscription, upgradeSubscription, downgradeSubscription, extendTrial } = useSubscription();
    const { getActiveOverride, addOverride } = useEnterprise();
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [updating, setUpdating] = useState(false);
    const [override, setOverride] = useState(null);

    const subscriptions = tenantData?.[tenant.id]?.subscriptions || [];
    const invoices = tenantData?.[tenant.id]?.invoices || [];
    const transactions = tenantData?.[tenant.id]?.transactions || [];
    const currentSubscription = subscriptions.find(s => s.status === 'active' || s.status === 'trialing');

    useEffect(() => {
        const loadOverride = async () => {
            const result = await getActiveOverride(tenant.id);
            if (result?.data) setOverride(result.data);
        };
        loadOverride();
    }, [tenant.id, getActiveOverride]);

    const handleCancel = async () => {
        if (!window.confirm(`Are you sure you want to cancel ${tenant.name}'s subscription?`)) return;
        setUpdating(true);
        await cancelSubscription(currentSubscription?.id, true, 'Admin action');
        await getTenantSubscriptions(tenant.id);
        setUpdating(false);
    };

    const handleExtendTrial = async () => {
        if (!currentSubscription || currentSubscription.status !== 'trialing') return;
        setUpdating(true);
        await extendTrial(currentSubscription?.id, 14);
        await getTenantSubscriptions(tenant.id);
        setUpdating(false);
    };

    const handleApplyDiscount = async () => {
        const discount = prompt('Enter discount percentage (0-100):', '10');
        if (discount && !isNaN(discount)) {
            setUpdating(true);
            await addOverride({ tenant_id: tenant.id, plan_id: currentSubscription?.plan_id, discount_percentage: parseFloat(discount), valid_until: new Date(Date.now() + 365 * 86400000).toISOString() });
            setUpdating(false);
        }
    };

    const tabs = [
        { id: 'subscriptions', label: 'Subscriptions', icon: FiCreditCard, count: subscriptions.length },
        { id: 'invoices', label: 'Invoices', icon: FiCalendar, count: invoices.length },
        { id: 'transactions', label: 'Transactions', icon: FiDollarSign, count: transactions.length }
    ];

    return (
        <div className="tenant-manager-overlay">
            <div className="tenant-manager-modal">
                <div className="tenant-manager-header">
                    <div className="tenant-manager-title">
                        <h2>{tenant.name}</h2>
                        <p>{tenant.email}</p>
                    </div>
                    <button className="tenant-manager-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="tenant-manager-tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} className={`tenant-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            <tab.icon /> {tab.label} {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                <div className="tenant-manager-content">
                    {loading ? <LoadingSkeleton type="card" count={1} /> : (
                        <>
                            {activeTab === 'subscriptions' && (
                                <div className="tenant-subscriptions">
                                    {currentSubscription ? (
                                        <div className="subscription-details">
                                            <div className="sub-detail-header"><StatusBadge type="subscription" status={currentSubscription.status} size="lg" /><div className="sub-actions">{override && <span className="discount-badge"><FiAward /> {override.discount_percentage}% OFF</span>}</div></div>
                                            <div className="sub-detail-row"><span className="label">Plan:</span><span className="value">{currentSubscription.plan?.name || currentSubscription.plan_name}</span></div>
                                            <div className="sub-detail-row"><span className="label">Amount:</span><span className="value"><CurrencyFormatter amount={currentSubscription.amount} />/{currentSubscription.billing_interval}</span></div>
                                            <div className="sub-detail-row"><span className="label">Current Period:</span><span className="value">{new Date(currentSubscription.current_period_start).toLocaleDateString()} - {new Date(currentSubscription.current_period_end).toLocaleDateString()}</span></div>
                                            <div className="sub-detail-row"><span className="label">Auto Renew:</span><span className="value">{currentSubscription.auto_renew ? 'Yes' : 'No'}</span></div>
                                            <div className="sub-actions-buttons">
                                                <button className="sub-action-btn warning" onClick={handleCancel} disabled={updating}>Cancel Subscription</button>
                                                {currentSubscription.status === 'trialing' && <button className="sub-action-btn info" onClick={handleExtendTrial} disabled={updating}>Extend Trial (14 days)</button>}
                                                <button className="sub-action-btn success" onClick={handleApplyDiscount} disabled={updating}>Apply Discount</button>
                                            </div>
                                        </div>
                                    ) : <EmptyState type="subscriptions" title="No active subscription" />}
                                    {subscriptions.filter(s => s.status !== 'active' && s.status !== 'trialing').length > 0 && (
                                        <div className="subscription-history"><h4>Subscription History</h4>{subscriptions.filter(s => s.status !== 'active' && s.status !== 'trialing').map(sub => (<div key={sub.id} className="history-item"><StatusBadge type="subscription" status={sub.status} size="sm" /><span>{sub.plan?.name}</span><span>{new Date(sub.created_at).toLocaleDateString()}</span></div>))}</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="tenant-invoices">
                                    {invoices.length === 0 ? <EmptyState type="invoices" /> : (
                                        <table className="tenant-table"><thead><tr><th>Invoice #</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                                            {invoices.map(inv => (<tr key={inv.id}><td>{inv.invoice_number}</td><td>{new Date(inv.invoice_date).toLocaleDateString()}</td><td>{new Date(inv.due_date).toLocaleDateString()}</td><td><CurrencyFormatter amount={inv.total_amount} /></td><td><StatusBadge type="invoice" status={inv.status} size="sm" /></td></tr>))}
                                        </tbody></table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'transactions' && (
                                <div className="tenant-transactions">
                                    {transactions.length === 0 ? <EmptyState type="transactions" /> : (
                                        <table className="tenant-table"><thead><tr><th>Reference</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                                            {transactions.map(tx => (<tr key={tx.id}><td>{tx.reference?.slice(-12)}</td><td>{new Date(tx.created_at).toLocaleDateString()}</td><td><CurrencyFormatter amount={tx.total_amount} /></td><td><StatusBadge type="transaction" status={tx.status} size="sm" /></td></tr>))}
                                        </tbody></table>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TenantSubscriptionManager;
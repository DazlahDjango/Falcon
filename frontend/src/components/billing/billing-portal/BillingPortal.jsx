import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiFileText, FiActivity, FiSettings, FiShield, FiBell, FiCalendar, FiDollarSign, FiUsers, FiArrowRight, FiCheckCircle, FiAlertCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { useInvoices } from '../../../hooks/billing/useInvoices';
import { useTransactions } from '../../../hooks/billing/useTransactions';
import { usePaymentMethods } from '../../../hooks/billing/usePaymentMethods';
import { useBillingPortal } from '../../../hooks/billing/useBillingPortal';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { PortalSubscription } from './PortalSubscription';
import { PortalInvoices } from './PortalInvoices';
import { PortalPaymentMethods } from './PortalPaymentMethods';
import { PortalSettings } from './PortalSettings';
import { PortalActivity } from './PortalActivity';
import './billing-portal.css';

export const BillingPortal = () => {
    const { permissions } = useBillingPermissions();
    const { subscription, loading: subLoading, fetchCurrent } = useSubscription({ autoFetch: true });
    const { invoices, loading: invLoading, fetchAll: fetchInvoices } = useInvoices({ autoFetch: true });
    const { transactions, loading: txLoading, fetchAll: fetchTransactions } = useTransactions({ autoFetch: true });
    const { paymentMethods, loading: pmLoading, fetchAll: fetchPaymentMethods } = usePaymentMethods({ autoFetch: true });
    const { getOverview, portalOverview } = useBillingPortal();
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (permissions.canViewBilling) {
            fetchCurrent();
            fetchInvoices({ page: 1, pageSize: 5 });
            fetchTransactions({ page: 1, pageSize: 5 });
            fetchPaymentMethods();
            getOverview();
        }
    }, [permissions.canViewBilling]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchCurrent(), fetchInvoices({ page: 1, pageSize: 5 }), fetchTransactions({ page: 1, pageSize: 5 }), fetchPaymentMethods(), getOverview()]);
        setRefreshing(false);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiActivity },
        { id: 'subscription', label: 'Subscription', icon: FiCalendar },
        { id: 'invoices', label: 'Invoices', icon: FiFileText },
        { id: 'payment-methods', label: 'Payment Methods', icon: FiCreditCard },
        { id: 'activity', label: 'Activity', icon: FiBell },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    const isLoading = subLoading || invLoading || txLoading || pmLoading;

    if (!permissions.canViewBilling) return <EmptyState type="default" title="Access Denied" message="You don't have permission to access the billing portal." />;

    return (
        <BillingShell title="Billing Portal" subtitle="Manage your subscription, invoices, and payment methods">
            <div className="billing-portal">
                <div className="portal-header-actions">
                    <button className="portal-refresh-btn" onClick={handleRefresh} disabled={refreshing}><FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh</button>
                </div>

                <div className="portal-tabs">
                    {tabs.map(tab => (<button key={tab.id} className={`portal-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}><tab.icon /> {tab.label}</button>))}
                </div>

                <div className="portal-content">
                    {activeTab === 'overview' && (
                        <div className="portal-overview">
                            <div className="overview-stats-grid">
                                <div className="stat-card"><div className="stat-icon"><FiDollarSign /></div><div className="stat-info"><span className="stat-label">Monthly Spend</span><span className="stat-value"><CurrencyFormatter amount={subscription?.amount || 0} showCents={false} /></span></div></div>
                                <div className="stat-card"><div className="stat-icon"><FiCalendar /></div><div className="stat-info"><span className="stat-label">Next Billing</span><span className="stat-value">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</span></div></div>
                                <div className="stat-card"><div className="stat-icon"><FiUsers /></div><div className="stat-info"><span className="stat-label">Active Users</span><span className="stat-value">{portalOverview?.activeUsers || 0}</span></div></div>
                                <div className="stat-card"><div className="stat-icon"><FiShield /></div><div className="stat-info"><span className="stat-label">Auto-Renewal</span><span className={`stat-value ${subscription?.auto_renew ? 'active' : 'inactive'}`}>{subscription?.auto_renew ? 'Enabled' : 'Disabled'}</span></div></div>
                            </div>

                            <div className="overview-sections">
                                <div className="overview-section subscription-preview">
                                    <h3>Current Subscription</h3>
                                    {isLoading ? <LoadingSkeleton type="card" count={1} /> : subscription ? (<><div className="preview-plan"><span className="plan-name">{subscription.plan?.name}</span><StatusBadge type="subscription" status={subscription.status} size="sm" /></div><div className="preview-price"><CurrencyFormatter amount={subscription.amount} currency={subscription.currency} /><span>/{subscription.billing_interval}</span></div><button className="preview-action" onClick={() => setActiveTab('subscription')}>Manage Subscription <FiArrowRight /></button></>) : (<EmptyState type="subscriptions" />)}
                                </div>

                                <div className="overview-section recent-invoices">
                                    <h3>Recent Invoices</h3>
                                    {isLoading ? <LoadingSkeleton type="card" count={1} /> : invoices?.slice(0, 3).map(inv => (<div key={inv.id} className="preview-invoice"><div className="invoice-info"><span className="invoice-number">{inv.invoice_number}</span><StatusBadge type="invoice" status={inv.status} size="sm" /></div><div className="invoice-amount"><CurrencyFormatter amount={inv.total_amount} currency={inv.currency} /></div></div>))}
                                    {invoices?.length > 0 && <button className="preview-action" onClick={() => setActiveTab('invoices')}>View All Invoices <FiArrowRight /></button>}
                                </div>

                                <div className="overview-section payment-methods-preview">
                                    <h3>Payment Methods</h3>
                                    {isLoading ? <LoadingSkeleton type="card" count={1} /> : paymentMethods?.slice(0, 2).map(pm => (<div key={pm.id} className="preview-payment"><div className="payment-icon"><FiCreditCard /></div><div className="payment-info"><span className="payment-name">{pm.display_name}</span>{pm.is_default && <span className="default-badge">Default</span>}</div></div>))}
                                    <button className="preview-action" onClick={() => setActiveTab('payment-methods')}>Manage Payment Methods <FiArrowRight /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && <PortalSubscription subscription={subscription} loading={isLoading} onUpdate={handleRefresh} />}
                    {activeTab === 'invoices' && <PortalInvoices invoices={invoices} loading={isLoading} />}
                    {activeTab === 'payment-methods' && <PortalPaymentMethods paymentMethods={paymentMethods} loading={isLoading} onUpdate={handleRefresh} />}
                    {activeTab === 'activity' && <PortalActivity transactions={transactions} loading={isLoading} />}
                    {activeTab === 'settings' && <PortalSettings subscription={subscription} onUpdate={handleRefresh} />}
                </div>
            </div>
        </BillingShell>
    );
};

export default BillingPortal;
import React from 'react';
import PropTypes from 'prop-types';
import { useSubscription, useInvoices, usePaymentMethods, useBillingAnalytics } from '../../../hooks/billing';
import { SubscriptionStatus } from '../subscription/SubscriptionStatus';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { TrialBanner } from '../subscription/TrialBanner';

export const BillingOverview = ({ onRefresh }) => {
    const { subscription, loading: subLoading, isOnTrial, trialDaysRemaining } = useSubscription();
    const { invoices, loading: invLoading, summary } = useInvoices({ limit: 5 });
    const { paymentMethods, loading: pmLoading } = usePaymentMethods();
    const { summary: analytics, loading: analyticsLoading } = useBillingAnalytics();

    const loading = subLoading || invLoading || pmLoading || analyticsLoading;

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />;
    }

    const totalOutstanding = summary?.total_outstanding || 0;
    const hasPaymentMethod = paymentMethods.length > 0;
    const nextInvoiceAmount = subscription?.auto_renew ? subscription.amount : null;

    return (
        <div className="billing-overview">
            {isOnTrial && (
                <TrialBanner 
                    daysRemaining={trialDaysRemaining}
                    onUpgrade={onRefresh}
                />
            )}

            <div className="billing-overview-grid">
                <div className="billing-metric-card">
                    <div className="billing-metric-icon">💰</div>
                    <div className="billing-metric-content">
                        <span className="billing-metric-label">Monthly Spend</span>
                        <span className="billing-metric-value">
                            KES {((subscription?.amount || 0) / 100).toLocaleString()}
                        </span>
                        {subscription && (
                            <span className="billing-metric-sub">
                                {subscription.billing_interval} billing
                            </span>
                        )}
                    </div>
                </div>

                <div className="billing-metric-card">
                    <div className="billing-metric-icon">📄</div>
                    <div className="billing-metric-content">
                        <span className="billing-metric-label">Outstanding Balance</span>
                        <span className="billing-metric-value">
                            KES {(totalOutstanding / 100).toLocaleString()}
                        </span>
                        {totalOutstanding > 0 && (
                            <span className="billing-metric-sub warning">
                                {summary?.overdue > 0 ? 'Overdue' : 'Due soon'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="billing-metric-card">
                    <div className="billing-metric-icon">💳</div>
                    <div className="billing-metric-content">
                        <span className="billing-metric-label">Payment Methods</span>
                        <span className="billing-metric-value">
                            {paymentMethods.length}
                        </span>
                        <span className="billing-metric-sub">
                            {hasPaymentMethod ? 'Ready for auto-pay' : 'No payment method'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="billing-overview-section">
                <h3 className="billing-overview-section-title">Current Subscription</h3>
                <SubscriptionStatus subscription={subscription} loading={subLoading} />
            </div>

            {nextInvoiceAmount && (
                <div className="billing-overview-note">
                    <span>ℹ️</span>
                    <p>
                        Your next invoice of <strong>KES {(nextInvoiceAmount / 100).toLocaleString()}</strong> 
                        will be charged on {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                </div>
            )}

            {invoices.length > 0 && (
                <div className="billing-overview-section">
                    <h3 className="billing-overview-section-title">Recent Invoices</h3>
                    <div className="billing-overview-invoices">
                        {invoices.slice(0, 3).map((invoice) => (
                            <div key={invoice.id} className="billing-overview-invoice">
                                <div className="invoice-info">
                                    <span className="invoice-number">{invoice.invoice_number}</span>
                                    <span className="invoice-date">
                                        {new Date(invoice.invoice_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="invoice-amount">
                                    KES {((invoice.total_amount || 0) / 100).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

BillingOverview.propTypes = {
    onRefresh: PropTypes.func,
};

export default BillingOverview;
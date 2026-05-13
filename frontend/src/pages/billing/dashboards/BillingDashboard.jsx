import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    useCurrentSubscription, useSubscriptionStatus, useInvoiceSummary, useOutstandingInvoices,
    usePaymentSummary, useQuota, usePaymentMethods
} from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import SubscriptionDetails from '../../../components/billing/SubscriptionDetails';
import BillingSummaryCard from '../../../components/billing/BillingSummaryCard';
import SubscriptionStatusBadge from '../../../components/billing/SubscriptionStatusBadge';
import QuotaGauge from '../../../components/billing/QuotaGauge';
import QuotaWarningAlert from '../../../components/billing/QuotaWarningAlert';
import InvoiceTable from '../../../components/billing/InvoiceTable';
import PaymentMethodCard from '../../../components/billing/PaymentMethodCard';
import AddPaymentMethodModal from '../../../components/billing/AddPaymentMethodModal';
import { Spinner } from '../../../components/common/UI';
import { ArrowPathIcon, PlusIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const BillingDashboard = () => {
    const navigate = useNavigate();
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { data: subscription, isLoading: subLoading, refetch: refetchSubscription } = useCurrentSubscription();
    const { data: subscriptionStatus, refetch: refetchStatus } = useSubscriptionStatus();
    const { data: invoiceSummary, refetch: refetchInvoiceSummary } = useInvoiceSummary();
    const { data: outstandingInvoices, refetch: refetchOutstanding } = useOutstandingInvoices();
    const { data: paymentSummary, refetch: refetchPaymentSummary } = usePaymentSummary();
    const { data: quotaStatus, refetch: refetchQuota } = useQuota();
    const { data: paymentMethods, refetch: refetchPaymentMethods } = usePaymentMethods();
    const isLoading = subLoading;
    const handleRefreshAll = async () => {
        setRefreshing(true);
        await Promise.all([
            refetchSubscription(),
            refetchStatus(),
            refetchInvoiceSummary(),
            refetchOutstanding(),
            refetchPaymentSummary(),
            refetchQuota(),
            refetchPaymentMethods(),
        ]);
        setRefreshing(false);
    };
    const handleViewInvoices = () => {
        navigate(BILLING_ROUTES.INVOICES);
    };
    const handleViewPayments = () => {
        navigate(BILLING_ROUTES.PAYMENTS);
    };
    const handleUpgrade = () => {
        navigate(BILLING_ROUTES.PLANS);
    };
    const handleViewInvoice = (invoiceId) => {
        navigate(BILLING_ROUTES.INVOICE_DETAIL(invoiceId));
    };
    const handleDownloadInvoice = (invoiceId) => {
        console.log('Download invoice:', invoiceId);
    };
    const handleSendReminder = (invoiceId) => {
        console.log('Send reminder:', invoiceId);
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const hasOutstanding = outstandingInvoices?.invoices?.length > 0;
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your subscription, invoices, and payment methods</p>
                </div>
                <button
                    onClick={handleRefreshAll}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
            {quotaStatus && (
                <QuotaWarningAlert
                    quotaStatus={quotaStatus}
                    onUpgrade={handleUpgrade}
                    onRefresh={refetchQuota}
                />
            )}
            <SubscriptionDetails
                subscription={subscription}
                isLoading={subLoading}
                onSync={refetchSubscription}
            />
            <BillingSummaryCard
                summary={invoiceSummary}
                onViewInvoices={handleViewInvoices}
                onViewPayments={handleViewPayments}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {quotaStatus && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-4">Usage Overview</h3>
                            <div className="space-y-4">
                                <QuotaGauge
                                    used={quotaStatus.users?.current || 0}
                                    total={quotaStatus.users?.max || 1}
                                    label="Users"
                                    size="sm"
                                />
                                <QuotaGauge
                                    used={quotaStatus.kpis?.current || 0}
                                    total={quotaStatus.kpis?.max || 1}
                                    label="KPIs"
                                    size="sm"
                                />
                                <div className="pt-2">
                                    <button
                                        onClick={handleUpgrade}
                                        className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        View Usage Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-semibold text-gray-900">Payment Methods</h3>
                            <button
                                onClick={() => setShowAddPaymentModal(true)}
                                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add New
                            </button>
                        </div>  
                        {paymentMethods?.length === 0 ? (
                            <div className="text-center py-6">
                                <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No payment methods added</p>
                                <button
                                    onClick={() => setShowAddPaymentModal(true)}
                                    className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                                >
                                    Add your first payment method
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paymentMethods?.slice(0, 2).map((method) => (
                                    <PaymentMethodCard
                                        key={method.id}
                                        method={method}
                                        showActions={false}
                                    />
                                ))}
                                {paymentMethods?.length > 2 && (
                                    <button
                                        onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        View all ({paymentMethods.length}) →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-semibold text-gray-900">
                                Recent Invoices
                                {hasOutstanding && (
                                    <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                        {outstandingInvoices?.invoices?.length} outstanding
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={handleViewInvoices}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                View All →
                            </button>
                        </div>
                        {outstandingInvoices?.invoices?.length > 0 ? (
                            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-orange-800">
                                    You have {outstandingInvoices.invoices.length} unpaid invoice(s)
                                    totaling {outstandingInvoices.currency} {outstandingInvoices.total_outstanding?.toLocaleString()}
                                </p>
                            </div>
                        ) : null}
                        <InvoiceTable
                            invoices={outstandingInvoices?.invoices?.slice(0, 5) || []}
                            onView={handleViewInvoice}
                            onDownload={handleDownloadInvoice}
                            onSendReminder={handleSendReminder}
                            showStatusFilter={false}
                        />                      
                        {(!outstandingInvoices?.invoices || outstandingInvoices.invoices.length === 0) && (
                            <div className="text-center py-8">
                                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AddPaymentMethodModal
                isOpen={showAddPaymentModal}
                onClose={() => setShowAddPaymentModal(false)}
                onSuccess={refetchPaymentMethods}
            />
        </div>
    );
};
export default BillingDashboard;
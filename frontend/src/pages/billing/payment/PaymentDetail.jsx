import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment, useRetryPayment } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { formatCurrency } from '../../../config/constants/billingConstants';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { ArrowLeftIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
const PaymentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showRetryConfirm, setShowRetryConfirm] = React.useState(false);
    const { data: payment, isLoading } = usePayment(id);
    const retryPayment = useRetryPayment();
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const handleRetry = async () => {
        await retryPayment.mutateAsync(id);
        setShowRetryConfirm(false);
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!payment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Payment not found.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PAYMENTS)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    Back to Payments
                </button>
            </div>
        );
    }
    const getStatusColor = () => {
        switch (payment.status) {
            case 'succeeded': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'refunded': return 'text-gray-600 bg-gray-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(BILLING_ROUTES.PAYMENTS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
                    <p className="text-gray-500 mt-1">Transaction ID: {payment.id}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Transaction Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(payment.amount, payment.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                                {payment.status?.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Date</p>
                            <p className="font-medium text-gray-900">{formatDate(payment.payment_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-medium text-gray-900 capitalize">{payment.payment_method?.method_type || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Invoice Number</p>
                            <p className="font-medium text-gray-900">
                                {payment.invoice_number || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transaction ID</p>
                            <p className="font-mono text-sm text-gray-600">{payment.stripe_payment_intent_id || '—'}</p>
                        </div>
                    </div>
                    {payment.failure_reason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800">
                                <strong>Failure Reason:</strong> {payment.failure_reason}
                            </p>
                        </div>
                    )}
                    {payment.refunded_amount > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong>Refunded Amount:</strong> {formatCurrency(payment.refunded_amount, payment.currency)}
                            </p>
                            {payment.refunded_at && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Refunded on: {formatDate(payment.refunded_at)}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-3">
                {payment.receipt_url && (
                    <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        View Receipt
                    </a>
                )}
                {payment.status === 'failed' && (
                    <button
                        onClick={() => setShowRetryConfirm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Retry Payment
                    </button>
                )}
            </div>
            <ConfirmDialog
                isOpen={showRetryConfirm}
                onClose={() => setShowRetryConfirm(false)}
                onConfirm={handleRetry}
                title="Retry Payment"
                confirmText="Yes, Retry"
                cancelText="Cancel"
                isLoading={retryPayment.isLoading}
            >
                <p className="text-gray-600">
                    Are you sure you want to retry this payment? This will attempt to charge your default payment method again.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default PaymentDetail;
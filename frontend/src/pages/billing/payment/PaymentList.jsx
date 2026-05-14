import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments, usePaymentSummary, useRetryPayment } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import PaymentHistoryTable from '../../../components/billing/PaymentHistoryTable';
import { Spinner } from '../../../components/common/UI';
import { FiCreditCard, FiFilter } from 'react-icons/fi';

const PaymentList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const { data: paymentsData, isLoading, refetch } = usePayments({}, {
        page,
        pageSize: 20,
        status: statusFilter !== 'all' ? statusFilter : null,
    });
    const { data: summary } = usePaymentSummary();
    const retryPayment = useRetryPayment();
    const handleViewDetails = (paymentId) => {
        navigate(BILLING_ROUTES.PAYMENT_DETAIL(paymentId));
    };
    const handleRetry = async (paymentId) => {
        await retryPayment.mutateAsync(paymentId);
        await refetch();
    };
    if (isLoading && !paymentsData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const payments = paymentsData?.payments || [];
    const pagination = paymentsData?.pagination || { page: 1, pageSize: 20, total: 0 };
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-500 mt-1">View all your payment transactions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600">Total Paid</p>
                    <p className="text-2xl font-bold text-green-700">
                        {summary?.currency || 'KES'} {summary?.total_succeeded?.toLocaleString() || '0'}
                    </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-red-600">Failed Payments</p>
                    <p className="text-2xl font-bold text-red-700">
                        {summary?.currency || 'KES'} {summary?.total_failed?.toLocaleString() || '0'}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Refunded</p>
                    <p className="text-2xl font-bold text-gray-700">
                        {summary?.currency || 'KES'} {summary?.total_refunded?.toLocaleString() || '0'}
                    </p>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FiFilter className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="succeeded">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    Showing {payments.length} of {pagination.total} transactions
                </div>
            </div>
            {payments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FiCreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Records</h3>
                    <p className="text-gray-500">No payment transactions found.</p>
                </div>
            ) : (
                <>
                    <PaymentHistoryTable
                        payments={payments}
                        onViewDetails={handleViewDetails}
                        onRetry={handleRetry}
                    />
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default PaymentList;
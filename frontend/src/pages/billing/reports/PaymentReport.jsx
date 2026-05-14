import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments, usePaymentSummary } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import { FiArrowLeft, FiDownload, FiPrinter, FiCalendar } from 'react-icons/fi';
import { formatCurrency } from '../../../config/constants/billingConstants';

const PaymentReport = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const { data: paymentsData, isLoading, refetch } = usePayments({
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        status: statusFilter !== 'all' ? statusFilter : null,
    });
    const { data: summary } = usePaymentSummary();

    const payments = paymentsData?.payments || [];
    const pagination = paymentsData?.pagination || {};

    const calculateTotals = () => {
        const totalSucceeded = payments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalFailed = payments
            .filter(p => p.status === 'failed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalRefunded = payments
            .filter(p => p.status === 'refunded')
            .reduce((sum, p) => sum + (p.refunded_amount || 0), 0);

        return { totalSucceeded, totalFailed, totalRefunded };
    };

    const totals = calculateTotals();
    const successRate = payments.filter(p => p.status === 'succeeded').length / (payments.length || 1) * 100;

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE');
    };
    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    };
    const handleApplyFilter = () => {
        refetch();
    };
    const handleExport = async (format) => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        alert(`Export as ${format} would download here`);
    };
    const handlePrint = () => {
        window.print();
    };
    if (isLoading && payments.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.REPORTS)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Report</h1>
                        <p className="text-gray-500 mt-1">Generate and analyze payment transaction data</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiPrinter className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiDownload className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="succeeded">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <button
                        onClick={handleApplyFilter}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                    >
                        Apply
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{pagination.total || payments.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{Math.round(successRate)}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Processed</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalSucceeded, 'KES')}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Failed Amount</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalFailed, 'KES')}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No payment records found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatTime(payment.payment_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                        payment.status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {payment.payment_method?.method_type || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                            {payment.stripe_payment_intent_id?.slice(-8) || '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {payments.length > 0 && (
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="2" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Totals
                                    </td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                                        {formatCurrency(totals.totalSucceeded, 'KES')}
                                    </td>
                                    <td colSpan="3" className="px-6 py-3"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
export default PaymentReport;
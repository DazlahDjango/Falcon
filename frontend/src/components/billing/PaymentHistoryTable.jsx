import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../../config/constants/billingConstants';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '../../config/constants/billingConstants';

const PaymentHistoryTable = ({ 
    payments, 
    onViewDetails, 
    onRetry,
    isLoading = false,
    showRetryButton = true,
}) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const filteredPayments = statusFilter === 'all' 
        ? payments 
        : payments.filter(p => p.status === statusFilter);
    const getStatusBadge = (status) => {
        const color = PAYMENT_STATUS_COLORS[status] || '#6B7280';
        const label = PAYMENT_STATUS_LABELS[status] || status;  
        return (
            <span 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${color}15`, color }}
            >
                {label}
            </span>
        );
    };
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-KE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                ))}
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        statusFilter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            statusFilter === value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No payment records found
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(payment.payment_date)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatTime(payment.payment_date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </div>
                                        {payment.refunded_amount > 0 && (
                                            <div className="text-xs text-red-600">
                                                Refunded: {formatCurrency(payment.refunded_amount, payment.currency)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(payment.status)}
                                        {payment.failure_reason && payment.status === 'failed' && (
                                            <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                                                {payment.failure_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.payment_method?.method_type || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onViewDetails?.(payment.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="View Details"
                                            >
                                                <FiEye className="w-5 h-5" />
                                            </button>
                                            {showRetryButton && payment.status === 'failed' && (
                                                <button
                                                    onClick={() => onRetry?.(payment.id)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Retry Payment"
                                                >
                                                    <FiRefreshCw className="w-5 h-5" />
                                                </button>
                                            )}
                                            {payment.receipt_url && (
                                                <a
                                                    href={payment.receipt_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                                    title="View Receipt"
                                                >
                                                    <FiDollarSign className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
PaymentHistoryTable.propTypes = {
    payments: PropTypes.array.isRequired,
    onViewDetails: PropTypes.func,
    onRetry: PropTypes.func,
    isLoading: PropTypes.bool,
    showRetryButton: PropTypes.bool,
};
PaymentHistoryTable.defaultProps = {
    isLoading: false,
    showRetryButton: true,
};
export default PaymentHistoryTable;
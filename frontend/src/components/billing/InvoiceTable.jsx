import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EyeIcon, DocumentArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../config/constants/billingConstants';
import { INVOICE_STATUS, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../../config/constants/billingConstants';
const InvoiceTable = ({ 
    invoices, 
    onView, 
    onDownload, 
    onSendReminder,
    isLoading = false,
    showStatusFilter = true,
}) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const filteredInvoices = statusFilter === 'all' 
        ? invoices 
        : invoices.filter(inv => inv.status === statusFilter);
    const getStatusBadge = (status) => {
        const color = INVOICE_STATUS_COLORS[status] || '#6B7280';
        const label = INVOICE_STATUS_LABELS[status] || status;  
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
    const isOverdue = (invoice) => {
        return invoice.status === 'open' && invoice.due_date && new Date(invoice.due_date) < new Date();
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
            {showStatusFilter && (
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
                    {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
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
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(invoice.invoice_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                                            {formatDate(invoice.due_date)}
                                            {isOverdue(invoice) && ' (Overdue)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(invoice.amount_due, invoice.currency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(invoice.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onView?.(invoice.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="View Details"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {invoice.status !== 'paid' && (
                                                <button
                                                    onClick={() => onSendReminder?.(invoice.id)}
                                                    className="text-gray-400 hover:text-amber-600 transition-colors"
                                                    title="Send Reminder"
                                                >
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDownload?.(invoice.id)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Download PDF"
                                            >
                                                <DocumentArrowDownIcon className="w-5 h-5" />
                                            </button>
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
InvoiceTable.propTypes = {
    invoices: PropTypes.array.isRequired,
    onView: PropTypes.func,
    onDownload: PropTypes.func,
    onSendReminder: PropTypes.func,
    isLoading: PropTypes.bool,
    showStatusFilter: PropTypes.bool,
};
export default InvoiceTable;
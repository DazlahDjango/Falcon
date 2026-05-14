import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import { formatCurrency } from '../../config/constants/billingConstants';
import InvoiceStatusBadge from './SubscriptionStatusBadge';

const InvoiceDetailModal = ({ invoice, isOpen, onClose, onDownload }) => {
    if (!isOpen || !invoice) return null;
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const handlePrint = () => {
        window.print();
    };
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Invoice #{invoice.invoice_number}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Generated on {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="text-gray-400 hover:text-gray-600"
                                title="Print"
                            >
                                <FiPrinter className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onDownload?.(invoice.id)}
                                className="text-gray-400 hover:text-primary-600"
                                title="Download PDF"
                            >
                                <FiDownload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="font-medium mt-1">{invoice.status?.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Invoice Date</p>
                                <p className="font-medium mt-1">{formatDate(invoice.invoice_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className={`font-medium mt-1 ${invoice.is_overdue ? 'text-red-600' : ''}`}>
                                    {formatDate(invoice.due_date)}
                                    {invoice.is_overdue && ' (Overdue)'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Currency</p>
                                <p className="font-medium mt-1">{invoice.currency}</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Line Items</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {invoice.line_items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                                    {formatCurrency(item.unit_amount, invoice.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(item.amount, invoice.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                                Subtotal
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(invoice.amount_due - (invoice.tax_amount || 0), invoice.currency)}
                                            </td>
                                        </tr>
                                        {invoice.tax_amount > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right text-sm text-gray-600">
                                                    Tax
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {formatCurrency(invoice.tax_amount, invoice.currency)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right text-base font-bold text-gray-900">
                                                Total
                                            </td>
                                            <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                                                {formatCurrency(invoice.amount_due, invoice.currency)}
                                            </td>
                                        </tr>
                                        {invoice.amount_paid > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right text-sm text-green-600">
                                                    Amount Paid
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600">
                                                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                                                </td>
                                            </tr>
                                        )}
                                        {invoice.amount_remaining > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right text-sm text-red-600">
                                                    Amount Due
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600">
                                                    {formatCurrency(invoice.amount_remaining, invoice.currency)}
                                                </td>
                                            </tr>
                                        )}
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        {invoice.status !== 'paid' && (
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800">
                                    💳 Payment Instructions: Please pay the amount due by {formatDate(invoice.due_date)}.
                                    You can make payment using your saved payment method or add a new one.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>
                        {invoice.status !== 'paid' && (
                            <button
                                onClick={() => onDownload?.(invoice.id)}
                                className="ml-3 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                            >
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

InvoiceDetailModal.propTypes = {
    invoice: PropTypes.shape({
        id: PropTypes.string,
        invoice_number: PropTypes.string,
        status: PropTypes.string,
        amount_due: PropTypes.number,
        amount_paid: PropTypes.number,
        amount_remaining: PropTypes.number,
        currency: PropTypes.string,
        invoice_date: PropTypes.string,
        due_date: PropTypes.string,
        is_overdue: PropTypes.bool,
        tax_amount: PropTypes.number,
        line_items: PropTypes.array,
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func,
};
export default InvoiceDetailModal;
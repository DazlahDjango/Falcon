import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useInvoiceSummary } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon, PrinterIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../config/constants/billingConstants';

const InvoiceReport = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [isExporting, setIsExporting] = useState(false);
    
    const { data: invoicesData, isLoading, refetch } = useInvoices({
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
    });
    const { data: summary } = useInvoiceSummary();
    
    const invoices = invoicesData?.invoices || [];
    const pagination = invoicesData?.pagination || {};
    
    const calculateTotals = () => {
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount_due || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
        const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.amount_remaining || 0), 0);
        const paidCount = invoices.filter(inv => inv.status === 'paid').length;
        const overdueCount = invoices.filter(inv => inv.is_overdue).length;
        
        return { totalAmount, totalPaid, totalOutstanding, paidCount, overdueCount };
    };
    
    const totals = calculateTotals();
    
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE');
    };
    
    const handleApplyFilter = () => {
        refetch();
    };
    
    const handleExport = async (format) => {
        setIsExporting(true);
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        // In production, this would download the file
        alert(`Export as ${format} would download here`);
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    if (isLoading && invoices.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.REPORTS)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Report</h1>
                        <p className="text-gray-500 mt-1">Generate and analyze invoice data</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div className="flex gap-2">
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
                    <p className="text-sm text-gray-500">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{pagination.total || invoices.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalAmount, 'KES')}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalPaid, 'KES')}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Outstanding</p>
                    <p className={`text-2xl font-bold ${totals.totalOutstanding > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(totals.totalOutstanding, 'KES')}
                    </p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No invoices found for the selected date range
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(invoice.invoice_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(invoice.due_date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(invoice.amount_due, invoice.currency)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatCurrency(invoice.amount_paid, invoice.currency)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {invoices.length > 0 && (
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Totals
                                    </td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                                        {formatCurrency(totals.totalAmount, 'KES')}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                                        {formatCurrency(totals.totalPaid, 'KES')}
                                    </td>
                                    <td className="px-6 py-3"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};
export default InvoiceReport;
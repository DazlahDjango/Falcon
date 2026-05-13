import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useInvoiceSummary, useDownloadInvoice, useSendInvoiceReminder } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import InvoiceTable from '../../../components/billing/InvoiceTable';
import InvoiceDetailModal from '../../../components/billing/InvoiceDetailModal';
import BillingSummaryCard from '../../../components/billing/BillingSummaryCard';
import { Spinner } from '../../../components/common/UI';
import { DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';

const InvoiceList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { data: invoicesData, isLoading, refetch } = useInvoices({}, {
        page,
        pageSize: 20,
        status: statusFilter !== 'all' ? statusFilter : null,
    });
    const { data: summary } = useInvoiceSummary();
    const downloadInvoice = useDownloadInvoice();
    const sendReminder = useSendInvoiceReminder();
    const handleViewInvoice = (invoiceId) => {
        const invoice = invoicesData?.invoices?.find(i => i.id === invoiceId);
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
    };
    const handleDownloadInvoice = async (invoiceId) => {
        await downloadInvoice.mutateAsync(invoiceId);
    };
    const handleSendReminder = async (invoiceId) => {
        await sendReminder.mutateAsync(invoiceId);
        refetch();
    };
    const handleViewPayments = () => {
        navigate(BILLING_ROUTES.PAYMENTS);
    };
    if (isLoading && !invoicesData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const invoices = invoicesData?.invoices || [];
    const pagination = invoicesData?.pagination || { page: 1, pageSize: 20, total: 0 };
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-500 mt-1">View and manage all your invoices</p>
            </div>
            <BillingSummaryCard
                summary={summary}
                onViewInvoices={() => {}}
                onViewPayments={handleViewPayments}
            />
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="open">Open</option>
                        <option value="draft">Draft</option>
                        <option value="void">Void</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    Showing {invoices.length} of {pagination.total} invoices
                </div>
            </div>
            {invoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                    <p className="text-gray-500">You don't have any invoices yet.</p>
                </div>
            ) : (
                <>
                    <InvoiceTable
                        invoices={invoices}
                        onView={handleViewInvoice}
                        onDownload={handleDownloadInvoice}
                        onSendReminder={handleSendReminder}
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
            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedInvoice(null);
                }}
                onDownload={handleDownloadInvoice}
            />
        </div>
    );
};
export default InvoiceList;
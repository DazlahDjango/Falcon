import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useDownloadInvoice } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { formatCurrency } from '../../../config/constants/billingConstants';
import { Spinner } from '../../../components/common/UI';
import InvoiceDetailModal from '../../../components/billing/InvoiceDetailModal';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: invoice, isLoading } = useInvoice(id);
    const downloadInvoice = useDownloadInvoice();
    const handleDownload = async (invoiceId) => {
        await downloadInvoice.mutateAsync(invoiceId);
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }
    if (!invoice) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Invoice not found.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.INVOICES)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    Back to Invoices
                </button>
            </div>
        );
    }  
    return (
        <InvoiceDetailModal
            invoice={invoice}
            isOpen={true}
            onClose={() => navigate(BILLING_ROUTES.INVOICES)}
            onDownload={handleDownload}
        />
    );
};
export default InvoiceDetail;
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice } from '../../hooks/billing';
import { InvoiceDetail } from '../../components/billing/invoices/InvoiceDetail';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

export const InvoiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { invoice, loading, error, downloadPDF, payInvoice } = useInvoice(id);

    const handleDownload = async () => {
        await downloadPDF();
    };

    const handlePay = async () => {
        await payInvoice();
        // Refresh after payment
        window.location.reload();
    };

    if (loading) {
        return (
            <BillingLayout title="Invoice Details">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    if (error || !invoice) {
        return (
            <BillingLayout title="Invoice Not Found">
                <div className="error-state">
                    <p>Invoice not found</p>
                    <button onClick={() => navigate('/invoices')} className="btn-primary">
                        Back to Invoices
                    </button>
                </div>
            </BillingLayout>
        );
    }

    return (
        <BillingLayout title={`Invoice ${invoice.invoice_number}`}>
            <InvoiceDetail 
                invoice={invoice}
                onDownload={handleDownload}
                onPay={handlePay}
            />
        </BillingLayout>
    );
};

export default InvoiceDetailPage;
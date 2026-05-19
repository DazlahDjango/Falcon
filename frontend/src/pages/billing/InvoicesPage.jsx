import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesList } from '../../components/billing/invoices/InvoicesList';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const InvoicesPage = () => {
    const navigate = useNavigate();

    const handleInvoiceClick = (invoiceId) => {
        navigate(`/invoices/${invoiceId}`);
    };

    return (
        <BillingLayout 
            title="Invoices"
            subtitle="View and download your billing history"
        >
            <InvoicesList onInvoiceClick={handleInvoiceClick} />
        </BillingLayout>
    );
};

export default InvoicesPage;
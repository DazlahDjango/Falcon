import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesList } from '../../components/billing/invoices/InvoicesList';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { buildBillingPath, BILLING_ROUTES } from '../../config/constants/billingRouteConstants';

export const InvoicesPage = () => {
    const navigate = useNavigate();

    const handleInvoiceClick = (invoiceId) => {
        navigate(buildBillingPath(BILLING_ROUTES.INVOICE_DETAIL(), { id: invoiceId }));
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
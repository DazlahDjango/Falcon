import React from 'react';
import { BillingPortal } from '../../components/billing/billing-portal/BillingPortal';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const BillingPortalPage = () => (
    <BillingLayout
        title="Billing Overview"
        subtitle="Subscription, usage, and payment summary for your organization"
    >
        <BillingPortal />
    </BillingLayout>
);

export default BillingPortalPage;
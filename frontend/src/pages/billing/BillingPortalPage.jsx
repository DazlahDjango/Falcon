import React from 'react';
import { BillingPortal } from '../../components/billing/billing-portal/BillingPortal';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const BillingPortalPage = () => {
    return (
        <BillingLayout>
            <BillingPortal />
        </BillingLayout>
    );
};

export default BillingPortalPage;
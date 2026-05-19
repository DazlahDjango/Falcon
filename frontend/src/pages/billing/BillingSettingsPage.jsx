import React from 'react';
import { BillingSettings } from '../../components/billing/billing-portal/BillingSettings';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const BillingSettingsPage = () => {
    return (
        <BillingLayout 
            title="Billing Settings"
            subtitle="Manage your billing preferences"
        >
            <BillingSettings />
        </BillingLayout>
    );
};

export default BillingSettingsPage;
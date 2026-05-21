import React from 'react';
import BillingOperationsConsole from '../../components/billing/operations/BillingOperationsConsole';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const BillingPlatformSettingsPage = () => (
    <BillingLayout title="Platform Settings" subtitle="Super-admin billing policy and real-time toggles">
        <BillingOperationsConsole />
    </BillingLayout>
);

export default BillingPlatformSettingsPage;

import React from 'react';
import { AdminBillingDashboard } from '../../../components/billing/admin/AdminBillingDashboard';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminBillingPage = () => {
    return (
        <BillingLayout
            title="Billing Administration"
            subtitle="Platform revenue, subscriptions, and tenant billing health"
        >
            <AdminBillingDashboard />
        </BillingLayout>
    );
};

export default AdminBillingPage;
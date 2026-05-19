import React from 'react';
import { AdminBillingDashboard } from '../../../components/billing/admin/AdminBillingDashboard';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminBillingPage = () => {
    return (
        <BillingLayout>
            <AdminBillingDashboard />
        </BillingLayout>
    );
};

export default AdminBillingPage;
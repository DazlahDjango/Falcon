import React from 'react';
import { PlanManager } from '../../../components/billing/admin/PlanManager';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminPlansPage = () => {
    return (
        <BillingLayout 
            title="Manage Plans"
            subtitle="Create and manage subscription plans"
        >
            <PlanManager />
        </BillingLayout>
    );
};

export default AdminPlansPage;
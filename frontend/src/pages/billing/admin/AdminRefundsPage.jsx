import React from 'react';
import { FailedTransactionsMonitor } from '../../../components/billing/admin/FailedTransactionsMonitor';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminRefundsPage = () => {
    return (
        <BillingLayout 
            title="Refund Management"
            subtitle="Process refunds for failed transactions"
        >
            <FailedTransactionsMonitor />
        </BillingLayout>
    );
};

export default AdminRefundsPage;
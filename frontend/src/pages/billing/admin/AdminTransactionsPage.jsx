import React from 'react';
import { TransactionsList } from '../../../components/billing/transactions/TransactionsList';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminTransactionsPage = () => {
    return (
        <BillingLayout 
            title="All Transactions"
            subtitle="View all payment transactions across tenants"
        >
            <TransactionsList showFilter={true} />
        </BillingLayout>
    );
};

export default AdminTransactionsPage;
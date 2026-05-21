import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionsList } from '../../components/billing/transactions/TransactionsList';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { buildBillingPath, BILLING_ROUTES } from '../../config/constants/billingRouteConstants';

export const TransactionsPage = () => {
    const navigate = useNavigate();

    const handleTransactionClick = (transactionId) => {
        navigate(buildBillingPath(BILLING_ROUTES.TRANSACTION_DETAIL(), { id: transactionId }));
    };

    return (
        <BillingLayout 
            title="Transaction History"
            subtitle="View all your payment transactions"
        >
            <TransactionsList onTransactionClick={handleTransactionClick} />
        </BillingLayout>
    );
};

export default TransactionsPage;
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransaction } from '../../hooks/billing';
import { TransactionDetails } from '../../components/billing/transactions/TransactionDetails';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

export const TransactionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transaction, loading, error, verifyTransaction } = useTransaction(id);

    if (loading) {
        return (
            <BillingLayout title="Transaction Details">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    if (error || !transaction) {
        return (
            <BillingLayout title="Transaction Not Found">
                <div className="error-state">
                    <p>Transaction not found</p>
                    <button onClick={() => navigate(BILLING_ROUTES.TRANSACTIONS)} className="btn-primary">
                        Back to Transactions
                    </button>
                </div>
            </BillingLayout>
        );
    }

    return (
        <BillingLayout title={`Transaction ${transaction.reference}`}>
            <TransactionDetails 
                transaction={transaction}
                onVerify={verifyTransaction}
            />
        </BillingLayout>
    );
};

export default TransactionDetailPage;
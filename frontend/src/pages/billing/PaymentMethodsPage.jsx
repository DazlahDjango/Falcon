import React from 'react';
import { PaymentMethodsList } from '../../components/billing/payment-methods/PaymentMethodsList';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const PaymentMethodsPage = () => {
    return (
        <BillingLayout 
            title="Payment Methods"
            subtitle="Manage your saved payment methods for automatic billing"
        >
            <PaymentMethodsList />
        </BillingLayout>
    );
};

export default PaymentMethodsPage;
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCheckout } from '../../hooks/billing';
import { CheckoutSuccess } from '../../components/billing/checkout/CheckoutSuccess';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

export const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('reference');
    const [verifying, setVerifying] = useState(true);
    const [transaction, setTransaction] = useState(null);
    const { verifyCheckout } = useCheckout();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                navigate(BILLING_ROUTES.PORTAL);
                return;
            }
            
            try {
                const result = await verifyCheckout(reference);
                setTransaction(result);
            } catch (error) {
                console.error('Verification error:', error);
            } finally {
                setVerifying(false);
            }
        };
        
        verifyPayment();
    }, [reference]);

    if (verifying) {
        return (
            <BillingLayout title="Verifying Payment">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    const amount = transaction?.amount || 0;

    return (
        <BillingLayout title="Payment Successful">
            <CheckoutSuccess 
                amount={amount}
                onClose={() => navigate(BILLING_ROUTES.PORTAL)}
            />
        </BillingLayout>
    );
};

export default CheckoutSuccessPage;
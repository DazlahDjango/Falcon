import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckoutForm } from '../../components/billing/checkout';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan');

    return <CheckoutForm planId={planId} redirectToPaystack={true} />;
};

export default CheckoutPage;
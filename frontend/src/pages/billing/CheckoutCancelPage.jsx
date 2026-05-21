import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { EmptyState } from '../../components/billing/shared/EmptyState';

export const CheckoutCancelPage = () => {
    const navigate = useNavigate();

    return (
        <BillingLayout title="Payment Cancelled">
            <EmptyState 
                title="Payment was cancelled"
                message="Your payment was not completed. You can try again whenever you're ready."
                icon="❌"
                action={
                    <div className="cancel-page-actions">
                        <button onClick={() => navigate(BILLING_ROUTES.PLANS)} className="btn-primary">
                            View Plans
                        </button>
                        <button onClick={() => navigate(BILLING_ROUTES.PORTAL)} className="btn-secondary">
                            Go to Billing
                        </button>
                    </div>
                }
            />
        </BillingLayout>
    );
};

export default CheckoutCancelPage;
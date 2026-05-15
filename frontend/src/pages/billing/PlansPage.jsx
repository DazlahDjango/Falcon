import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../hooks/billing';
import { PlansList } from '../../components/billing/plans/PlansList';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const PlansPage = () => {
    const navigate = useNavigate();
    const { plans, loading, error, billingCycle, setBillingCycle } = usePlans();

    const handleSelectPlan = (plan) => {
        navigate('/checkout', { state: { plan, billingCycle } });
    };

    return (
        <BillingLayout 
            title="Choose Your Plan"
            subtitle="Select the perfect plan for your organization. All plans include a 14-day free trial."
        >
            <PlansList 
                plans={plans}
                loading={loading}
                error={error}
                onSelectPlan={handleSelectPlan}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
            />
        </BillingLayout>
    );
};

export default PlansPage;
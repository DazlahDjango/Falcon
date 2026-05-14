import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, useCurrentSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import PricingCard from '../../../components/billing/PricingCard';
import { Spinner } from '../../../components/common/UI';
import { BILLING_INTERVALS, BILLING_INTERVAL_LABELS } from '../../../config/constants/billingConstants';

const PlanList = () => {
    const navigate = useNavigate();
    const [billingInterval, setBillingInterval] = useState('month');
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const { data: plansData, isLoading: plansLoading } = usePlans();
    const { data: currentSubscription, isLoading: subLoading } = useCurrentSubscription();
    const isLoading = plansLoading || subLoading;
    const plans = plansData?.plans || [];
    const currentPlanId = currentSubscription?.plan?.id;
    const handleSelectPlan = (planId) => {
        setSelectedPlanId(planId);
    };
    const handleContinue = () => {
        if (selectedPlanId) {
            navigate(BILLING_ROUTES.CHECKOUT, {
                state: { planId: selectedPlanId, billingInterval }
            });
        }
    };
    const trialPlan = plans.find(p => p.plan_type === 'trial');
    const paidPlans = plans.filter(p => p.plan_type !== 'trial');
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
                <p className="text-gray-500 mt-2">Select the perfect plan for your organization's needs</p>
            </div>
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    {Object.entries(BILLING_INTERVAL_LABELS).map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setBillingInterval(value)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingInterval === value
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {label}
                            {value === 'year' && (
                                <span className="ml-1 text-xs text-green-600">(Save 20%)</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            {trialPlan && !currentPlanId && (
                <div className="max-w-md mx-auto">
                    <PricingCard
                        plan={trialPlan}
                        isPopular={false}
                        isCurrent={false}
                        billingInterval={billingInterval}
                        onSelect={handleSelectPlan}
                        isSelected={selectedPlanId === trialPlan.id}
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidPlans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        isPopular={plan.is_recommended}
                        isCurrent={currentPlanId === plan.id}
                        billingInterval={billingInterval}
                        onSelect={handleSelectPlan}
                        isSelected={selectedPlanId === plan.id}
                    />
                ))}
            </div>
            {selectedPlanId && selectedPlanId !== currentPlanId && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                    <button
                        onClick={handleContinue}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-all"
                    >
                        Continue with Selected Plan
                    </button>
                </div>
            )}
            <div className="text-center text-sm text-gray-500 pt-8">
                <p>All plans include a 14-day free trial. No credit card required.</p>
                <p className="mt-1">Need a custom plan? <a href="/contact" className="text-primary-600 hover:underline">Contact sales</a></p>
            </div>
        </div>
    );
};
export default PlanList;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, useCurrentSubscription, useUpdateSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import PricingCard from '../../../components/billing/PricingCard';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SubscriptionDowngrade = () => {
    const navigate = useNavigate();
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data: plansData, isLoading: plansLoading } = usePlans();
    const { data: currentSubscription, isLoading: subLoading } = useCurrentSubscription();
    const updateSubscription = useUpdateSubscription();
    const isLoading = plansLoading || subLoading;
    const plans = plansData?.plans || [];
    const currentPlanId = currentSubscription?.plan?.id;
    const currentPlan = plans.find(p => p.id === currentPlanId);
    const downgradePlans = plans.filter(plan => {
        if (plan.id === currentPlanId) return false;
        if (plan.plan_type === 'trial') return false; 
        const currentPrice = currentPlan?.price_monthly;
        const planPrice = plan.price_monthly;
        return planPrice < currentPrice;
    });
    const handleSelectPlan = (planId) => {
        setSelectedPlanId(planId);
    };
    const handleDowngrade = async () => {
        if (selectedPlanId) {
            await updateSubscription.mutateAsync({
                id: currentSubscription.id,
                data: { plan_id: selectedPlanId }
            });
            setShowConfirm(false);
            navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT);
        }
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (downgradePlans.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Downgrade Available</h2>
                <p className="text-gray-500 mb-6">
                    You are currently on our basic plan. No downgrade options are available.
                </p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Back to Subscription
                </button>
            </div>
        );
    }
    const selectedPlan = downgradePlans.find(p => p.id === selectedPlanId);
    const willLoseFeatures = selectedPlan?.features?.length < currentPlan?.features?.length;
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Downgrade Subscription</h1>
                    <p className="text-gray-500 mt-1">Choose a lower plan to reduce your monthly cost</p>
                </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Current Plan:</strong> {currentPlan?.name} - {currentPlan?.currency} {currentPlan?.price_monthly}/month
                </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Features will be reduced</p>
                        <p className="text-sm text-amber-700 mt-1">
                            Downgrading may remove access to某些 features. Review the plan details carefully before proceeding.
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {downgradePlans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        isPopular={false}
                        isCurrent={false}
                        onSelect={handleSelectPlan}
                        isSelected={selectedPlanId === plan.id}
                    />
                ))}
            </div>
            {selectedPlanId && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-8 py-3 bg-amber-600 text-white rounded-xl font-semibold shadow-lg hover:bg-amber-700 transition-all"
                    >
                        Downgrade to {selectedPlan?.name}
                    </button>
                </div>
            )}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDowngrade}
                title="Confirm Downgrade"
                confirmText="Yes, Downgrade Plan"
                cancelText="Cancel"
                variant="warning"
                isLoading={updateSubscription.isLoading}
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to downgrade from <strong>{currentPlan?.name}</strong> to <strong>{selectedPlan?.name}</strong>?
                    </p>
                    {willLoseFeatures && (
                        <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800">
                                ⚠️ You will lose access to the following features:
                            </p>
                            <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                                {currentPlan?.features?.slice(0, 3).map((f, i) => (
                                    <li key={i}>{f.name}</li>
                                ))}
                                {currentPlan?.features?.length > 3 && (
                                    <li>+{currentPlan.features.length - 3} more features</li>
                                )}
                            </ul>
                        </div>
                    )}
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-800">
                            💡 The change will take effect immediately. You'll receive a prorated credit for the remaining period.
                        </p>
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    );
};
export default SubscriptionDowngrade;
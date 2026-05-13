import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, useCurrentSubscription, useUpdateSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import PricingCard from '../../../components/billing/PricingCard';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SubscriptionUpgrade = () => {
    const navigate = useNavigate();
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [billingInterval, setBillingInterval] = useState('month');
    const { data: plansData, isLoading: plansLoading } = usePlans();
    const { data: currentSubscription, isLoading: subLoading } = useCurrentSubscription();
    const updateSubscription = useUpdateSubscription();
    const isLoading = plansLoading || subLoading;
    const plans = plansData?.plans || [];
    const currentPlanId = currentSubscription?.plan?.id;
    const currentPlan = plans.find(p => p.id === currentPlanId);
    const upgradePlans = plans.filter(plan => {
        if (plan.id === currentPlanId) return false;
        if (plan.plan_type === 'trial') return false;
        const currentPrice = billingInterval === 'month' ? currentPlan?.price_monthly : currentPlan?.price_yearly;
        const planPrice = billingInterval === 'month' ? plan.price_monthly : plan.price_yearly;
        return planPrice > currentPrice;
    });
    const handleSelectPlan = (planId) => {
        setSelectedPlanId(planId);
    };
    const handleUpgrade = async () => {
        if (selectedPlanId) {
            await updateSubscription.mutateAsync({
                id: currentSubscription.id,
                data: { plan_id: selectedPlanId, billing_interval: billingInterval }
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
    if (upgradePlans.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowPathIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Upgrade Available</h2>
                <p className="text-gray-500 mb-6">
                    You are currently on our highest tier plan. No upgrades are available at this time.
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
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_CURRENT)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upgrade Subscription</h1>
                    <p className="text-gray-500 mt-1">Choose a higher plan to unlock more features</p>
                </div>
            </div>
            
            {/* Current Plan Info */}
            {currentPlan && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Current Plan:</strong> {currentPlan.name} - 
                        {billingInterval === 'month' 
                            ? ` ${currentPlan.currency} ${currentPlan.price_monthly}/month`
                            : ` ${currentPlan.currency} ${currentPlan.price_yearly}/year`}
                    </p>
                </div>
            )}
            
            {/* Billing Interval Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                        onClick={() => setBillingInterval('month')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            billingInterval === 'month'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingInterval('year')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            billingInterval === 'year'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Yearly <span className="text-xs text-green-600">(Save 20%)</span>
                    </button>
                </div>
            </div>
            
            {/* Upgrade Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upgradePlans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        isPopular={plan.is_recommended}
                        isCurrent={false}
                        billingInterval={billingInterval}
                        onSelect={handleSelectPlan}
                        isSelected={selectedPlanId === plan.id}
                    />
                ))}
            </div>
            
            {/* Upgrade Button */}
            {selectedPlanId && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-all"
                    >
                        Upgrade to Selected Plan
                    </button>
                </div>
            )}
            
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleUpgrade}
                title="Confirm Upgrade"
                confirmText="Upgrade Now"
                cancelText="Cancel"
                isLoading={updateSubscription.isLoading}
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        You are about to upgrade your subscription. Your current plan will be replaced immediately.
                    </p>
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-800">
                            💡 You will be charged a prorated amount for the remaining period of your current billing cycle.
                        </p>
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    );
};
export default SubscriptionUpgrade;
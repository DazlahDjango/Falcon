import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlan, useCheckout } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { formatCurrency } from '../../../config/constants/billingConstants';
import { Spinner } from '../../../components/common/UI';
import { CheckIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId, billingInterval = 'month' } = location.state || {};
    const [isProcessing, setIsProcessing] = useState(false);
    const { data: plan, isLoading: planLoading } = usePlan(planId);
    const checkout = useCheckout();
    useEffect(() => {
        if (!planId) {
            navigate(BILLING_ROUTES.PLANS);
        }
    }, [planId, navigate]);
    const handleCheckout = async () => {
        if (!plan) return;
        setIsProcessing(true);
        const successUrl = `${window.location.origin}${BILLING_ROUTES.CHECKOUT_SUCCESS}`;
        const cancelUrl = `${window.location.origin}${BILLING_ROUTES.CHECKOUT_CANCEL}`;
        await checkout.mutateAsync({
            plan_id: plan.id,
            billing_interval: billingInterval,
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
        });  
        setIsProcessing(false);
    };
    if (planLoading || !plan) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const price = billingInterval === 'month' ? plan.price_monthly : plan.price_yearly;
    const formattedPrice = formatCurrency(price, plan.currency);
    const monthlyEquivalent = billingInterval === 'year' ? formatCurrency(plan.price_monthly, plan.currency) : null;
    const savings = billingInterval === 'year' && plan.price_yearly < plan.price_monthly * 12
        ? Math.round(((plan.price_monthly * 12) - plan.price_yearly) / (plan.price_monthly * 12) * 100)
        : 0;
    
    return (
        <div className="max-w-6xl mx-auto">
            <button
                onClick={() => navigate(BILLING_ROUTES.PLANS)}
                className="mb-6 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Plans
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <div>
                                    <p className="font-medium text-gray-900">{plan.name} Plan</p>
                                    <p className="text-sm text-gray-500 capitalize">{billingInterval}ly billing</p>
                                </div>
                                <p className="font-semibold text-gray-900">{formattedPrice}</p>
                            </div>
                            {billingInterval === 'year' && monthlyEquivalent && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Monthly equivalent</span>
                                    <span className="text-gray-600">{monthlyEquivalent}/month</span>
                                </div>
                            )}
                            {savings > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Annual savings</span>
                                    <span>{savings}%</span>
                                </div>
                            )}  
                            <div className="flex justify-between pt-4 border-t border-gray-200">
                                <span className="font-semibold text-gray-900">Total due today</span>
                                <span className="text-xl font-bold text-gray-900">{formattedPrice}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-medium text-gray-900 mb-3">What's Included</h3>
                        <div className="space-y-2">
                            {plan.features?.slice(0, 6).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">
                                        {feature.name}
                                        {feature.value && feature.value !== 'Yes' && (
                                            <span className="font-medium text-gray-900">: {feature.value}</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                            {plan.features?.length > 6 && (
                                <p className="text-sm text-gray-500 pl-7">
                                    +{plan.features.length - 6} more features
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                🎉 {plan.trial_days}-day free trial included. You won't be charged until after your trial ends.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            <span>Secure payment powered by Stripe</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || checkout.isLoading}
                            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing || checkout.isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                `Subscribe to ${plan.name}`
                            )}
                        </button>                      
                        <p className="text-xs text-center text-gray-500">
                            By subscribing, you agree to our Terms of Service and Privacy Policy.
                            You can cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Checkout;
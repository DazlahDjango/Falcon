import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlan, usePlanFeatures, useCurrentSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { formatCurrency } from '../../../config/constants/billingConstants';
import { Spinner } from '../../../components/common/UI';
import SubscriptionStatusBadge from '../../../components/billing/SubscriptionStatusBadge';
import { FiArrowLeft, FiCheck, FiZap, FiX } from 'react-icons/fi';

const PlanDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [billingInterval, setBillingInterval] = React.useState('month');
    const { data: plan, isLoading: planLoading } = usePlanBySlug(slug);
    const { data: features, isLoading: featuresLoading } = usePlanFeatures(plan?.id);
    const { data: currentSubscription } = useCurrentSubscription();
    const isLoading = planLoading || featuresLoading;
    const isCurrentPlan = currentSubscription?.plan?.id === plan?.id;
    const price = billingInterval === 'month' ? plan?.price_monthly : plan?.price_yearly;
    const formattedPrice = formatCurrency(price, plan?.currency);
    const monthlyEquivalent = billingInterval === 'year' ? formatCurrency(plan?.price_monthly, plan?.currency) : null;
    const savings = billingInterval === 'year' && plan?.price_yearly < plan?.price_monthly * 12
        ? Math.round(((plan?.price_monthly * 12) - plan?.price_yearly) / (plan?.price_monthly * 12) * 100)
        : 0;
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!plan) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Plan not found.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    View All Plans
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Plans
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                            {plan.is_recommended && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                    <FiZap className="w-3 h-3" />
                                    Recommended
                                </span>
                            )}
                            {isCurrentPlan && (
                                <SubscriptionStatusBadge status="active" size="sm" />
                            )}
                        </div>
                        <p className="text-gray-500 mt-2">{plan.description || `${plan.plan_type} plan for your organization`}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                        onClick={() => setBillingInterval('month')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingInterval === 'month'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Monthly Billing
                    </button>
                    <button
                        onClick={() => setBillingInterval('year')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingInterval === 'year'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Yearly Billing
                        <span className="ml-1 text-xs text-green-600">(Save {savings}%)</span>
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8 text-center">
                <p className="text-sm opacity-90 mb-2">Starting at</p>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{formattedPrice}</span>
                    <span className="text-lg opacity-90">/{billingInterval === 'month' ? 'month' : 'year'}</span>
                </div>
                {billingInterval === 'year' && monthlyEquivalent && (
                    <p className="text-sm opacity-80 mt-2">
                        {monthlyEquivalent}/month billed annually
                    </p>
                )}
                <div className="mt-6">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.CHECKOUT, { state: { planId: plan.id, billingInterval } })}
                        disabled={isCurrentPlan}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all ${isCurrentPlan
                                ? 'bg-gray-500 cursor-default'
                                : 'bg-white text-primary-700 hover:bg-gray-100'
                            }`}
                    >
                        {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                    </button>
                </div>
                {plan.trial_days > 0 && (
                    <p className="text-sm opacity-80 mt-4">
                        {plan.trial_days}-day free trial • Cancel anytime
                    </p>
                )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">All Features Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features?.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">{feature.name}</p>
                                {feature.description && (
                                    <p className="text-sm text-gray-500">{feature.description}</p>
                                )}
                                {feature.value && feature.value !== 'Yes' && feature.value !== 'No' && (
                                    <p className="text-sm text-primary-600 font-medium mt-1">{feature.value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Need more than {plan.name} plan offers?</p>
                <a href="/contact" className="text-primary-600 hover:underline">Contact our sales team</a> for custom enterprise pricing.
            </div>
        </div>
    );
};
export default PlanDetail;
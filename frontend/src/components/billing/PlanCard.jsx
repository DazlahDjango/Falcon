import React from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiZap } from 'react-icons/fi';
import { PLAN_TYPES, PLAN_TYPE_COLORS, PLAN_TYPE_LABELS } from '../../config/constants/billingConstants';
import { formatCurrency } from '../../config/constants/billingConstants';

const PlanCard = ({ plan, isCurrentPlan, onSelect, isSelected, billingInterval = 'month', isLoading = false }) => {
    const price = billingInterval === 'month' ? plan.price_monthly : plan.price_yearly;
    const formattedPrice = formatCurrency(price, plan.currency);
    const isRecommended = plan.is_recommended;
    const isTrial = plan.plan_type === PLAN_TYPES.TRIAL;
    const planColor = PLAN_TYPE_COLORS[plan.plan_type] || '#6B7280';
    const planLabel = PLAN_TYPE_LABELS[plan.plan_type] || plan.name;
    return (
        <div 
            className={`relative rounded-2xl border transition-all duration-200 ${
                isSelected 
                    ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            } ${isCurrentPlan ? 'bg-primary-50' : 'bg-white'}`}
        >
            {isRecommended && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                        <FiZap className="w-3 h-3" />
                        Recommended
                    </span>
                </div>
            )}
            {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current Plan
                    </span>
                </div>
            )}
            <div className="p-6">
                <div className="text-center mb-6">
                    <div 
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                        style={{ backgroundColor: `${planColor}20` }}
                    >
                        <div className="text-xl font-bold" style={{ color: planColor }}>
                            {plan.name.charAt(0)}
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description || planLabel}</p>
                </div>
                <div className="text-center mb-6">
                    {isTrial ? (
                        <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">Free Trial</span>
                            <p className="text-sm text-gray-500 mt-1">{plan.trial_days} days free</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900">{formattedPrice}</span>
                                <span className="text-gray-500">/{billingInterval === 'month' ? 'month' : 'year'}</span>
                            </div>
                            {billingInterval === 'year' && plan.price_yearly < plan.price_monthly * 12 && (
                                <p className="text-sm text-green-600 mt-1">
                                    Save {formatCurrency((plan.price_monthly * 12) - plan.price_yearly, plan.currency)}/year
                                </p>
                            )}
                        </>
                    )}
                </div>
                <div className="space-y-3 mb-8">
                    {plan.features?.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">
                                {feature.name}
                                {feature.value && feature.value !== 'Yes' && feature.value !== 'No' && (
                                    <span className="font-semibold text-gray-900">: {feature.value}</span>
                                )}
                            </span>
                        </div>
                    ))}
                    {plan.features?.length > 6 && (
                        <div className="text-sm text-gray-500 text-center pt-2">
                            +{plan.features.length - 6} more features
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onSelect?.(plan.id)}
                    disabled={isLoading || isCurrentPlan}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        isCurrentPlan
                            ? 'bg-gray-100 text-gray-500 cursor-default'
                            : isSelected
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isCurrentPlan ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                </button>
            </div>
        </div>
    );
};

PlanCard.propTypes = {
    plan: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        plan_type: PropTypes.string.isRequired,
        price_monthly: PropTypes.number.isRequired,
        price_yearly: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
        trial_days: PropTypes.number,
        is_recommended: PropTypes.bool,
        features: PropTypes.array,
    }).isRequired,
    isCurrentPlan: PropTypes.bool,
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    billingInterval: PropTypes.oneOf(['month', 'year']),
    isLoading: PropTypes.bool,
};
PlanCard.defaultProps = {
    isCurrentPlan: false,
    onSelect: null,
    isSelected: false,
    billingInterval: 'month',
    isLoading: false,
};

export default PlanCard;
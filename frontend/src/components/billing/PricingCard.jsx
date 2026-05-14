import React from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiZap, FiArrowRight } from 'react-icons/fi';
import { formatCurrency } from '../../config/constants/billingConstants';

const PricingCard = ({ 
    plan, 
    isPopular = false,
    isCurrent = false,
    billingInterval = 'month',
    onSelect,
    isSelected = false,
    className = '',
}) => {
    const price = billingInterval === 'month' ? plan.price_monthly : plan.price_yearly;
    const formattedPrice = formatCurrency(price, plan.currency);
    const monthlyEquivalent = billingInterval === 'year' ? formatCurrency(plan.price_monthly, plan.currency) : null;
    const savings = billingInterval === 'year' && plan.price_yearly < plan.price_monthly * 12
        ? Math.round(((plan.price_monthly * 12) - plan.price_yearly) / (plan.price_monthly * 12) * 100)
        : 0;
    const isTrial = plan.plan_type === 'trial';
    
    return (
        <div 
            className={`relative rounded-2xl transition-all duration-300 ${
                isPopular 
                    ? 'shadow-xl border-2 border-primary-500 scale-105 z-10' 
                    : 'shadow-lg border border-gray-200 hover:shadow-xl'
            } ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''} ${className}`}
        >
            {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                        <FiZap className="w-3 h-3" />
                        Most Popular
                    </span>
                </div>
            )}
            {isCurrent && (
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current Plan
                    </span>
                </div>
            )}
            <div className="p-6">
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description || plan.plan_type}</p>
                </div>
                <div className="text-center mb-6">
                    {isTrial ? (
                        <div>
                            <span className="text-3xl font-bold text-gray-900">Free Trial</span>
                            <p className="text-sm text-gray-500 mt-1">{plan.trial_days} days free</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900">{formattedPrice}</span>
                                <span className="text-gray-500">/{billingInterval === 'month' ? 'month' : 'year'}</span>
                            </div>
                            {billingInterval === 'year' && monthlyEquivalent && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {monthlyEquivalent}/month billed annually
                                </p>
                            )}
                            {savings > 0 && (
                                <p className="text-sm text-green-600 mt-1">
                                    Save {savings}% with annual billing
                                </p>
                            )}
                        </>
                    )}
                </div>
                <div className="space-y-3 mb-8">
                    {plan.features?.slice(0, 8).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">
                                {feature.name}
                                {feature.value && feature.value !== 'Yes' && feature.value !== 'No' && (
                                    <span className="font-semibold text-gray-900">: {feature.value}</span>
                                )}
                            </span>
                        </div>
                    ))}
                    {plan.features?.length > 8 && (
                        <div className="text-sm text-gray-500 text-center pt-2">
                            +{plan.features.length - 8} more features
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onSelect?.(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        isCurrent
                            ? 'bg-gray-100 text-gray-500 cursor-default'
                            : isPopular
                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                                : 'border-2 border-gray-300 text-gray-700 hover:border-primary-600 hover:text-primary-600'
                    }`}
                >
                    {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Choose Plan'}
                    {!isCurrent && <FiArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
PricingCard.propTypes = {
    plan: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        plan_type: PropTypes.string.isRequired,
        price_monthly: PropTypes.number.isRequired,
        price_yearly: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
        trial_days: PropTypes.number,
        features: PropTypes.array,
    }).isRequired,
    isPopular: PropTypes.bool,
    isCurrent: PropTypes.bool,
    billingInterval: PropTypes.oneOf(['month', 'year']),
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    className: PropTypes.string,
};

PricingCard.defaultProps = {
    isPopular: false,
    isCurrent: false,
    billingInterval: 'month',
    isSelected: false,
    className: '',
};
export default PricingCard;
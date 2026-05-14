import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiX, FiMinus } from 'react-icons/fi';
import { formatCurrency } from '../../config/constants/billingConstants';

const PlanComparisonTable = ({ plans, features, billingInterval = 'month' }) => {
    const featureRows = useMemo(() => {
        if (!features || features.length === 0) return [];
        const categories = {};
        features.forEach(feature => {
            const category = feature.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(feature);
        });
        return Object.entries(categories).map(([category, categoryFeatures]) => ({
            category,
            features: categoryFeatures,
        }));
    }, [features]);
    const getFeatureValue = (feature, planId) => {
        const planFeature = feature.planValues?.[planId];
        if (!planFeature) return '—';  
        const value = planFeature.value;
        if (value === 'Yes' || value === 'yes' || value === 'true') {
            return <FiCheck className="w-5 h-5 text-green-500 mx-auto" />;
        }
        if (value === 'No' || value === 'no' || value === 'false') {
            return <FiX className="w-5 h-5 text-red-500 mx-auto" />;
        }
        if (value === '—' || !value) {
            return <FiMinus className="w-5 h-5 text-gray-400 mx-auto" />;
        }
        return <span className="text-sm text-gray-700">{value}</span>;
    };
    const getPlanPrice = (plan) => {
        if (plan.plan_type === 'trial') {
            return `Free for ${plan.trial_days} days`;
        }
        const price = billingInterval === 'month' ? plan.price_monthly : plan.price_yearly;
        const formattedPrice = formatCurrency(price, plan.currency);
        return `${formattedPrice}/${billingInterval === 'month' ? 'month' : 'year'}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50">
                            Feature
                        </th>
                        {plans.map((plan) => (
                            <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                <div className="text-base font-bold">{plan.name}</div>
                                <div className="text-sm text-gray-500 mt-1">{getPlanPrice(plan)}</div>
                                {plan.is_recommended && (
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                        Recommended
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {featureRows.map(({ category, features: categoryFeatures }) => (
                        <React.Fragment key={category}>
                            <tr className="bg-gray-100">
                                <td colSpan={plans.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-700">
                                    {category}
                                </td>
                            </tr>
                            {categoryFeatures.map((feature, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-700 sticky left-0 bg-white hover:bg-gray-50">
                                        {feature.name}
                                        {feature.tooltip && (
                                            <span className="ml-1 text-gray-400 cursor-help" title={feature.tooltip}>
                                                ⓘ
                                            </span>
                                        )}
                                    </td>
                                    {plans.map((plan) => (
                                        <td key={plan.id} className="px-6 py-3 text-center">
                                            {getFeatureValue(feature, plan.id)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

PlanComparisonTable.propTypes = {
    plans: PropTypes.array.isRequired,
    features: PropTypes.array.isRequired,
    billingInterval: PropTypes.oneOf(['month', 'year']),
};
export default PlanComparisonTable;
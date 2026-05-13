import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, usePlanComparisonMatrix } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import PlanComparisonTable from '../../../components/billing/PlanComparisonTable';
import { Spinner } from '../../../components/common/UI';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PlanCompare = () => {
    const navigate = useNavigate();
    const [billingInterval, setBillingInterval] = useState('month');
    const [selectedPlanIds, setSelectedPlanIds] = useState([]);
    const { data: plansData, isLoading: plansLoading } = usePlans();
    const { data: comparison, isLoading: compareLoading } = usePlanComparisonMatrix(selectedPlanIds);
    const isLoading = plansLoading;
    const plans = plansData?.plans || [];
    const paidPlans = plans.filter(p => p.plan_type !== 'trial');
    const handleTogglePlan = (planId) => {
        setSelectedPlanIds(prev => {
            if (prev.includes(planId)) {
                return prev.filter(id => id !== planId);
            }
            if (prev.length >= 4) {
                return prev;
            }
            return [...prev, planId];
        });
    };
    const handleSelectAll = () => {
        if (selectedPlanIds.length === paidPlans.length) {
            setSelectedPlanIds([]);
        } else {
            setSelectedPlanIds(paidPlans.map(p => p.id));
        }
    };
    const selectedPlans = plans.filter(p => selectedPlanIds.includes(p.id));
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Compare Plans</h1>
                    <p className="text-gray-500 mt-1">Compare features across different subscription plans</p>
                </div>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                >
                    View Plans
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Select Plans to Compare</h3>
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        {selectedPlanIds.length === paidPlans.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {paidPlans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => handleTogglePlan(plan.id)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                                selectedPlanIds.includes(plan.id)
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:border-primary-600'
                            }`}
                        >
                            {plan.name}
                            {selectedPlanIds.includes(plan.id) && (
                                <CheckIcon className="w-4 h-4 inline ml-2" />
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    Compare up to 4 plans at a time. Selected: {selectedPlanIds.length}/4
                </p>
            </div>
            {selectedPlans.length > 0 && (
                <div className="flex justify-end">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                billingInterval === 'month'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Monthly Pricing
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                billingInterval === 'year'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Yearly Pricing
                        </button>
                    </div>
                </div>
            )}
            {selectedPlans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">Select at least one plan to start comparing</p>
                </div>
            ) : compareLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <PlanComparisonTable
                    plans={selectedPlans}
                    features={comparison?.features || []}
                    billingInterval={billingInterval}
                />
            )}
            {selectedPlans.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Need Help Choosing?</h3>
                    <p className="text-sm text-blue-800">
                        Most customers choose the Professional plan for the best balance of features and price.
                        Enterprise customers typically benefit from custom pricing and dedicated support.
                    </p>
                    <button
                        onClick={() => navigate(BILLING_ROUTES.PLANS)}
                        className="mt-3 text-sm text-blue-700 hover:text-blue-800 font-medium"
                    >
                        View detailed pricing →
                    </button>
                </div>
            )}
        </div>
    );
};
export default PlanCompare;
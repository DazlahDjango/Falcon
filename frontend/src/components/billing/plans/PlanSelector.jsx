import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlanCard } from './PlanCard';
import { BillingCycleSelector } from '../subscription/BillingCycleSelector';

export const PlanSelector = ({ 
    plans, 
    onSelect, 
    initialPlanId = null,
    title = "Select a Plan",
    subtitle = "Choose the plan that works best for you"
}) => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(
        plans.find(p => p.id === initialPlanId) || null
    );

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        onSelect(plan, billingCycle);
    };

    const handleBillingCycleChange = (cycle) => {
        setBillingCycle(cycle);
        if (selectedPlan) {
            onSelect(selectedPlan, cycle);
        }
    };

    // Filter plans (exclude trial for selector)
    const paidPlans = plans.filter(p => p.plan_type !== 'trial');

    return (
        <div className="plan-selector">
            <div className="plan-selector-header">
                <h3 className="plan-selector-title">{title}</h3>
                <p className="plan-selector-subtitle">{subtitle}</p>
            </div>

            <BillingCycleSelector 
                value={billingCycle}
                onChange={handleBillingCycleChange}
            />

            <div className="plan-selector-grid">
                {paidPlans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isSelected={selectedPlan?.id === plan.id}
                        onSelect={handleSelectPlan}
                        billingCycle={billingCycle}
                        isPopular={plan.plan_type === 'professional'}
                    />
                ))}
            </div>
        </div>
    );
};

PlanSelector.propTypes = {
    plans: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    initialPlanId: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

export default PlanSelector;
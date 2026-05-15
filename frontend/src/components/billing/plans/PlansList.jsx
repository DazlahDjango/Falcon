import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlanCard } from './PlanCard';
import { BillingCycleSelector } from '../subscription/BillingCycleSelector';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

export const PlansList = ({ 
    plans, 
    loading, 
    error, 
    currentPlanId,
    onSelectPlan,
    onBillingCycleChange,
    billingCycle,
    title = "Choose Your Plan",
    subtitle = "Select the perfect plan for your organization"
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />;
    }

    if (error) {
        return (
            <EmptyState 
                title="Unable to load plans"
                message="Please try again later"
                icon="⚠️"
            />
        );
    }

    if (!plans || plans.length === 0) {
        return (
            <EmptyState 
                title="No plans available"
                message="Check back soon for available plans"
                icon="📋"
            />
        );
    }

    const handleSelectPlan = (plan) => {
        setSelectedPlanId(plan.id);
        onSelectPlan(plan);
    };

    // Determine popular plan (Professional)
    const getIsPopular = (plan) => plan.plan_type === 'professional';

    return (
        <div className="plans-container">
            <div className="plans-header">
                <h2 className="plans-title">{title}</h2>
                <p className="plans-subtitle">{subtitle}</p>
            </div>

            <BillingCycleSelector 
                value={billingCycle}
                onChange={onBillingCycleChange}
            />

            <div className="plans-grid">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isSelected={plan.id === currentPlanId}
                        onSelect={handleSelectPlan}
                        billingCycle={billingCycle}
                        isPopular={getIsPopular(plan)}
                    />
                ))}
            </div>
        </div>
    );
};

PlansList.propTypes = {
    plans: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
    currentPlanId: PropTypes.string,
    onSelectPlan: PropTypes.func.isRequired,
    onBillingCycleChange: PropTypes.func.isRequired,
    billingCycle: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

export default PlansList;
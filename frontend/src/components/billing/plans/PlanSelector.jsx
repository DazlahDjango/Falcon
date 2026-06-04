import React from 'react';
import { PlanCard } from './PlanCard';
import './plans.css';

export const PlanSelector = ({ plans, selectedPlanId, onSelectPlan, title = "Select a Plan", subtitle = "Choose the plan that best fits your needs" }) => {
    const sortedPlans = [...plans].sort((a, b) => a.display_order - b.display_order);

    return (
        <div className="plan-selector">
            <div className="plan-selector-header">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <div className="plan-selector-grid">
                {sortedPlans.map(plan => (
                    <div key={plan.id} className={`plan-selector-item ${selectedPlanId === plan.id ? 'selected' : ''}`} onClick={() => onSelectPlan(plan.id)}>
                        <PlanCard plan={plan} showCta={false} />
                        <div className="plan-selector-radio">
                            <div className={`radio-circle ${selectedPlanId === plan.id ? 'checked' : ''}`}>
                                {selectedPlanId === plan.id && <div className="radio-dot"></div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanSelector;
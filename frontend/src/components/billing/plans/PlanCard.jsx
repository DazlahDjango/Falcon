import React from 'react';
import PropTypes from 'prop-types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { PlanFeatureList } from './PlanFeatureList';
import { PLAN_TYPES } from '../../../config/constants/billingConstants';

export const PlanCard = ({ plan, isSelected, onSelect, billingCycle, isPopular }) => {
    const getPrice = () => {
        if (billingCycle === 'yearly' && plan.yearly_price) {
            return plan.yearly_price;
        }
        return plan.price;
    };

    const getPeriod = () => billingCycle === 'yearly' ? 'year' : 'month';

    const isTrial = plan.plan_type === PLAN_TYPES.TRIAL;
    const isEnterprise = plan.plan_type === PLAN_TYPES.ENTERPRISE;

    return (
        <div className={`plan-card ${isSelected ? 'plan-card-selected' : ''} ${isPopular ? 'plan-card-popular' : ''}`}>
            {isPopular && <div className="plan-card-badge">Most Popular</div>}
            
            <div className="plan-card-header">
                <h3 className="plan-card-name">{plan.name}</h3>
                {!isTrial && (
                    <PriceDisplay 
                        amount={getPrice()} 
                        period={getPeriod()}
                        size="large"
                    />
                )}
                {isTrial && (
                    <div className="plan-card-trial">
                        <span className="plan-card-trial-text">14-Day Free Trial</span>
                        <span className="plan-card-trial-subtext">No credit card required</span>
                    </div>
                )}
            </div>

            <PlanFeatureList plan={plan} />

            <div className="plan-card-footer">
                <button 
                    className={`plan-card-button ${isSelected ? 'plan-card-button-selected' : ''}`}
                    onClick={() => onSelect(plan)}
                    disabled={isSelected}
                >
                    {isSelected ? 'Current Plan' : isTrial ? 'Start Free Trial' : 'Select Plan'}
                </button>
                {isEnterprise && (
                    <p className="plan-card-contact">Contact sales for custom pricing</p>
                )}
            </div>
        </div>
    );
};

PlanCard.propTypes = {
    plan: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    billingCycle: PropTypes.string,
    isPopular: PropTypes.bool,
};

export default PlanCard;
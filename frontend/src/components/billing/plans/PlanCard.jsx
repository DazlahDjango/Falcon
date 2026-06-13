import React from 'react';
import { FiCheck, FiStar, FiArrowRight } from 'react-icons/fi';
import { PriceDisplay } from '../shared/PriceDisplay';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { PlanFeatureList } from './PlanFeatureList';
import './plans.css';

export const PlanCard = ({ plan, isPopular = false, onSelect, showCta = true }) => {
    const isEnterprise = plan.plan_type === 'enterprise';
    const yearlySavings = plan.yearly_price ? Math.round(((plan.price * 12) - plan.yearly_price) / (plan.price * 12) * 100) : 0;

    return (
        <div className={`plan-card ${isPopular ? 'popular' : ''} ${plan.plan_type}`}>
            {isPopular && <div className="plan-card-popular-badge"><FiStar /> Most Popular</div>}
            <div className="plan-card-header">
                <h3 className="plan-card-name">{plan.name}</h3>
                <p className="plan-card-description">{plan.description || `Perfect for ${plan.name.toLowerCase()} needs`}</p>
                <div className="plan-card-price">
                    <PriceDisplay price={plan.price} yearlyPrice={plan.yearly_price} currency={plan.currency} showYearly={!isEnterprise} />
                    {yearlySavings > 0 && <div className="plan-savings">Save {yearlySavings}% annually</div>}
                </div>
            </div>
            <div className="plan-card-features">
                <PlanFeatureList features={plan.features_list_display} limit={8} />
            </div>
            {showCta && (
                <div className="plan-card-footer">
                    <button className={`plan-select-btn ${plan.plan_type}`} onClick={onSelect}>
                        {plan.plan_type === 'trial' ? 'Start Free Trial' : isEnterprise ? 'Contact Sales' : 'Get Started'}
                        <FiArrowRight />
                    </button>
                    {plan.plan_type !== 'trial' && plan.plan_type !== 'enterprise' && <div className="plan-billing-note">Billed monthly or annually</div>}
                </div>
            )}
        </div>
    );
};

export default PlanCard;
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { BillingCycleSelector } from '../subscription/BillingCycleSelector';

export const PricingTiers = ({ plans, onSelect }) => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const getPrice = (plan) => {
        if (billingCycle === 'yearly' && plan.yearly_price) {
            return plan.yearly_price;
        }
        return plan.price;
    };

    const getSavings = (plan) => {
        if (billingCycle === 'yearly' && plan.yearly_price) {
            const monthlyTotal = plan.price * 12;
            const savings = monthlyTotal - plan.yearly_price;
            const percent = Math.round((savings / monthlyTotal) * 100);
            return percent;
        }
        return 0;
    };

    const paidPlans = plans.filter(p => p.plan_type !== 'trial');

    return (
        <div className="pricing-tiers">
            <BillingCycleSelector 
                value={billingCycle}
                onChange={setBillingCycle}
            />

            <div className="pricing-tiers-grid">
                {paidPlans.map((plan) => (
                    <div key={plan.id} className="pricing-tier">
                        <div className="pricing-tier-header">
                            <h3 className="pricing-tier-name">{plan.name}</h3>
                            <PriceDisplay 
                                amount={getPrice(plan)} 
                                period={billingCycle === 'yearly' ? 'year' : 'month'}
                                size="large"
                            />
                            {getSavings(plan) > 0 && (
                                <div className="pricing-tier-savings">
                                    Save {getSavings(plan)}% with yearly billing
                                </div>
                            )}
                        </div>
                        <button 
                            className="pricing-tier-button"
                            onClick={() => onSelect(plan, billingCycle)}
                        >
                            Get Started
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

PricingTiers.propTypes = {
    plans: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default PricingTiers;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiUsers, FiDatabase, FiTrendingUp, FiShield } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './plans.css';

export const PricingTiers = ({ plans, onSelectPlan }) => {
    const navigate = useNavigate();

    const getTierIcon = (planType) => {
        switch (planType) {
            case 'basic': return <FiUsers />;
            case 'professional': return <FiTrendingUp />;
            case 'enterprise': return <FiShield />;
            default: return <FiDatabase />;
        }
    };

    const getTierColor = (planType) => {
        switch (planType) {
            case 'basic': return '#3b82f6';
            case 'professional': return '#8b5cf6';
            case 'enterprise': return '#10b981';
            default: return '#6b7280';
        }
    };

    const handleSelect = (plan) => {
        if (plan.plan_type === 'enterprise') {
            window.location.href = '/contact-sales';
        } else if (onSelectPlan) {
            onSelectPlan(plan.id);
        } else {
            navigate(`/billing/checkout?plan=${plan.id}`);
        }
    };

    const nonTrialPlans = plans.filter(p => p.plan_type !== 'trial');

    return (
        <div className="pricing-tiers">
            <div className="pricing-tiers-header">
                <h3>Pricing Plans</h3>
                <p>Simple, transparent pricing that grows with you</p>
            </div>
            <div className="pricing-tiers-grid">
                {nonTrialPlans.map(plan => (
                    <div key={plan.id} className={`pricing-tier ${plan.plan_type}`}>
                        <div className="tier-header" style={{ borderBottomColor: getTierColor(plan.plan_type) }}>
                            <div className="tier-icon" style={{ background: `${getTierColor(plan.plan_type)}15`, color: getTierColor(plan.plan_type) }}>{getTierIcon(plan.plan_type)}</div>
                            <h3 className="tier-name">{plan.name}</h3>
                            <div className="tier-price">
                                <CurrencyFormatter amount={plan.price} currency={plan.currency} />
                                <span className="tier-period">/month</span>
                            </div>
                            {plan.yearly_price && <div className="tier-yearly">or <CurrencyFormatter amount={plan.yearly_price} currency={plan.currency} showCents={false} />/year</div>}
                        </div>
                        <div className="tier-features">
                            <ul>
                                <li><FiCheck /> Up to {plan.max_users === -1 ? 'unlimited' : plan.max_users} users</li>
                                <li><FiCheck /> Up to {plan.max_kpis === -1 ? 'unlimited' : plan.max_kpis} KPIs</li>
                                {plan.custom_branding && <li><FiCheck /> Custom branding</li>}
                                {plan.api_access && <li><FiCheck /> API access</li>}
                                {plan.advanced_analytics && <li><FiCheck /> Advanced analytics</li>}
                                {plan.priority_support && <li><FiCheck /> Priority support</li>}
                            </ul>
                        </div>
                        <button className="tier-select-btn" onClick={() => handleSelect(plan)}>
                            {plan.plan_type === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                            <FiArrowRight />
                        </button>
                    </div>
                ))}
            </div>
            <div className="pricing-footer">
                <p>All plans include a 14-day free trial. No credit card required.</p>
                <p className="pricing-tax-note">* Plus applicable taxes</p>
            </div>
        </div>
    );
};

export default PricingTiers;
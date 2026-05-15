import React from 'react';
import PropTypes from 'prop-types';
import { PriceDisplay } from '../shared/PriceDisplay';

export const PlanComparisonTable = ({ plans, billingCycle, onSelectPlan }) => {
    const getPrice = (plan) => {
        if (billingCycle === 'yearly' && plan.yearly_price) {
            return plan.yearly_price;
        }
        return plan.price;
    };
    const getPeriod = () => billingCycle === 'yearly' ? 'year' : 'month';
    const allFeatures = [
        { key: 'max_users', label: 'Maximum Users', getValue: (p) => p.max_users === -1 ? 'Unlimited' : p.max_users },
        { key: 'max_kpis', label: 'Maximum KPIs', getValue: (p) => p.max_kpis === -1 ? 'Unlimited' : p.max_kpis },
        { key: 'custom_branding', label: 'Custom Branding', getValue: (p) => p.custom_branding ? '✓' : '✗' },
        { key: 'api_access', label: 'API Access', getValue: (p) => p.api_access ? '✓' : '✗' },
        { key: 'sso_enabled', label: 'Single Sign-On', getValue: (p) => p.sso_enabled ? '✓' : '✗' },
        { key: 'advanced_analytics', label: 'Advanced Analytics', getValue: (p) => p.advanced_analytics ? '✓' : '✗' },
        { key: 'audit_logs', label: 'Audit Logs', getValue: (p) => p.audit_logs ? '✓' : '✗' },
        { key: 'custom_reports', label: 'Custom Reports', getValue: (p) => p.custom_reports ? '✓' : '✗' },
        { key: 'priority_support', label: 'Priority Support', getValue: (p) => p.priority_support ? '✓' : '✗' },
    ];

    return (
        <div className="plan-comparison">
            <div className="plan-comparison-header">
                <div className="plan-comparison-feature">Features</div>
                {plans.map((plan) => (
                    <div key={plan.id} className="plan-comparison-plan">
                        <h3>{plan.name}</h3>
                        <PriceDisplay amount={getPrice(plan)} period={getPeriod()} />
                        <button 
                            className="plan-comparison-select"
                            onClick={() => onSelectPlan(plan)}
                        >
                            Select
                        </button>
                    </div>
                ))}
            </div>

            <div className="plan-comparison-body">
                {allFeatures.map((feature) => (
                    <div key={feature.key} className="plan-comparison-row">
                        <div className="plan-comparison-feature-name">{feature.label}</div>
                        {plans.map((plan) => (
                            <div key={plan.id} className="plan-comparison-value">
                                {feature.getValue(plan)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

PlanComparisonTable.propTypes = {
    plans: PropTypes.array.isRequired,
    billingCycle: PropTypes.string.isRequired,
    onSelectPlan: PropTypes.func.isRequired,
};

export default PlanComparisonTable;
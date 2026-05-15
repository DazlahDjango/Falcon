import React from 'react';
import PropTypes from 'prop-types';

const FEATURE_ICONS = {
    included: '✓',
    notIncluded: '✗',
    unlimited: '∞',
};

export const PlanFeatureList = ({ plan, showAll = false }) => {
    const features = [
        { key: 'max_users', label: 'Users', value: plan.max_users === -1 ? 'Unlimited' : `${plan.max_users}` },
        { key: 'max_kpis', label: 'KPIs', value: plan.max_kpis === -1 ? 'Unlimited' : `${plan.max_kpis}` },
        { key: 'custom_branding', label: 'Custom Branding', value: plan.custom_branding },
        { key: 'api_access', label: 'API Access', value: plan.api_access },
        { key: 'sso_enabled', label: 'SSO', value: plan.sso_enabled },
        { key: 'advanced_analytics', label: 'Advanced Analytics', value: plan.advanced_analytics },
        { key: 'audit_logs', label: 'Audit Logs', value: plan.audit_logs },
        { key: 'custom_reports', label: 'Custom Reports', value: plan.custom_reports },
        { key: 'priority_support', label: 'Priority Support', value: plan.priority_support },
    ];

    const getIcon = (value) => {
        if (value === true || value === 'Included') return FEATURE_ICONS.included;
        if (value === false || value === 'Not Included') return FEATURE_ICONS.notIncluded;
        if (value === 'Unlimited') return FEATURE_ICONS.unlimited;
        return null;
    };

    const getValueDisplay = (feature) => {
        if (typeof feature.value === 'boolean') {
            return feature.value ? 'Included' : 'Not Included';
        }
        return feature.value;
    };

    const displayedFeatures = showAll ? features : features.slice(0, 6);

    return (
        <div className="plan-features">
            <ul className="plan-features-list">
                {displayedFeatures.map((feature) => (
                    <li key={feature.key} className="plan-feature-item">
                        <span className={`plan-feature-icon plan-feature-icon-${feature.value === true ? 'included' : 'not-included'}`}>
                            {getIcon(feature.value)}
                        </span>
                        <span className="plan-feature-label">{feature.label}</span>
                        <span className="plan-feature-value">{getValueDisplay(feature)}</span>
                    </li>
                ))}
            </ul>
            {!showAll && features.length > 6 && (
                <div className="plan-features-more">
                    <span>+{features.length - 6} more features</span>
                </div>
            )}
        </div>
    );
};

PlanFeatureList.propTypes = {
    plan: PropTypes.object.isRequired,
    showAll: PropTypes.bool,
};

export default PlanFeatureList;
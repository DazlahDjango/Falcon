import { useCurrentSubscription } from './useSubscription';
const FEATURE_PLAN_REQUIREMENTS = {
    custom_branding: ['professional', 'enterprise'],
    api_access: ['professional', 'enterprise'],
    sso: ['enterprise'],
    advanced_analytics: ['professional', 'enterprise'],
    audit_logs: ['basic', 'professional', 'enterprise'],
    reports: ['basic', 'professional', 'enterprise'],
    export: ['basic', 'professional', 'enterprise'],
    webhooks: ['professional', 'enterprise'],
    multi_currency: ['professional', 'enterprise'],
    priority_support: ['professional', 'enterprise'],
    sla: ['enterprise'],
    white_label: ['enterprise'],
};
export const useBillingFeatures = () => {
    const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription();
    const planType = subscription?.plan?.plan_type || 'trial';
    const hasFeature = React.useCallback((featureName) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'super_admin') return true;
        const featuresSnapshot = subscription?.features || {};
        if (featuresSnapshot[featureName]) {
            const value = featuresSnapshot[featureName]?.value;
            if (value && ['yes', 'true', 'enabled'].includes(value.toLowerCase())) {
                return true;
            }
        }
        const requiredPlans = FEATURE_PLAN_REQUIREMENTS[featureName] || [];
        return requiredPlans.includes(planType);
    }, [planType, subscription]);
    const getFeatureLimit = React.useCallback((featureName, defaultValue = null) => {
        const featuresSnapshot = subscription?.features || {};
        if (featuresSnapshot[featureName]) {
            const value = featuresSnapshot[featureName]?.value;
            if (value && !isNaN(parseInt(value))) {
                return parseInt(value);
            }
        }
        return defaultValue;
    }, [subscription]);
    const availableFeatures = React.useMemo(() => {
        return Object.keys(FEATURE_PLAN_REQUIREMENTS).reduce((acc, feature) => {
            acc[feature] = hasFeature(feature);
            return acc;
        }, {});
    }, [hasFeature]);  
    return {
        hasFeature,
        getFeatureLimit,
        availableFeatures,
        planType,
        isLoading: isLoadingSubscription,
    };
};
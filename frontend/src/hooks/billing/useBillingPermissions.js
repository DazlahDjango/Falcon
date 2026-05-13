import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { featureService } from '../../services/billing/feature.service';
import { FEATURE_FLAGS } from '../../config/constants/billingConstants';

export const useBillingPermissions = () => {
    const user = useSelector(state => state.auth.user);
    const userRole = user?.role;
    const canViewBilling = React.useMemo(() => {
        const allowedRoles = ['super_admin', 'client_admin', 'executive', 'dashboard_champion'];
        return allowedRoles.includes(userRole);
    }, [userRole]);
    const canManageBilling = React.useMemo(() => {
        const allowedRoles = ['super_admin', 'client_admin'];
        return allowedRoles.includes(userRole);
    }, [userRole]);
    const canViewInvoices = React.useMemo(() => {
        const allowedRoles = ['super_admin', 'client_admin', 'executive', 'dashboard_champion'];
        return allowedRoles.includes(userRole);
    }, [userRole]);
    const canManagePaymentMethods = React.useMemo(() => {
        const allowedRoles = ['super_admin', 'client_admin'];
        return allowedRoles.includes(userRole);
    }, [userRole]);
    const canViewQuota = React.useMemo(() => {
        const allowedRoles = ['super_admin', 'client_admin', 'executive', 'dashboard_champion'];
        return allowedRoles.includes(userRole);
    }, [userRole]);
    const isSuperAdmin = userRole === 'super_admin';
    const isClientAdmin = userRole === 'client_admin';
    const isExecutive = userRole === 'executive';
    const isDashboardChampion = userRole === 'dashboard_champion';  
    return {
        canViewBilling,
        canManageBilling,
        canViewInvoices,
        canManagePaymentMethods,
        canViewQuota,
        isSuperAdmin,
        isClientAdmin,
        isExecutive,
        isDashboardChampion,
        userRole,
    };
};
export const useBillingFeatures = () => {
    const { data: features, isLoading } = useQuery({
        queryKey: ['billing-features'],
        queryFn: async () => {
            const response = await featureService.getAvailableFeatures();
            return response.data || {};
        },
        staleTime: 5 * 60 * 1000,
        enabled: false, // Only fetch if needed in production
    });
    const hasFeature = (featureName) => {
        return features?.[featureName]?.available || false;
    };
    const getRequiredPlan = (featureName) => {
        return features?.[featureName]?.min_plan || null;
    };  
    return {
        features,
        hasFeature,
        getRequiredPlan,
        isLoading,
    };
};
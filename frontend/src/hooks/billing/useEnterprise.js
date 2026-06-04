import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverrides, createOverride, updateOverride, deleteOverride, fetchActiveOverride, expireOverrides, createDynamicPlan, updateDynamicPlan, fetchDynamicPlans, clearError, clearActiveOverride } from '../../store/billing/slices/enterpriseSlice';
import { selectOverrides, selectDynamicPlans, selectActiveOverride, selectEnterprisePagination, selectEnterpriseLoading, selectEnterpriseError } from '../../store/billing/selectors';
import { useBillingPermissions } from './useBillingPermissions';

export const useEnterprise = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const { permissions } = useBillingPermissions();
    const overrides = useSelector(selectOverrides);
    const dynamicPlans = useSelector(selectDynamicPlans);
    const activeOverride = useSelector(selectActiveOverride);
    const pagination = useSelector(selectEnterprisePagination);
    const loading = useSelector(selectEnterpriseLoading);
    const error = useSelector(selectEnterpriseError);
    const canManage = permissions.canManagePlans || permissions.isSuperAdmin;

    const fetchAllOverrides = useCallback((params) => { if (canManage) return dispatch(fetchOverrides(params)); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const addOverride = useCallback((data) => { if (canManage) return dispatch(createOverride(data)); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const editOverride = useCallback((id, data) => { if (canManage) return dispatch(updateOverride({ id, data })); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const removeOverride = useCallback((id) => { if (canManage) return dispatch(deleteOverride(id)); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const fetchActive = useCallback((tenantId) => dispatch(fetchActiveOverride(tenantId)), [dispatch]);
    const expireAllOverrides = useCallback(() => { if (canManage) return dispatch(expireOverrides()); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const addDynamicPlan = useCallback((planData) => { if (canManage) return dispatch(createDynamicPlan(planData)); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const editDynamicPlan = useCallback((id, planData) => { if (canManage) return dispatch(updateDynamicPlan({ id, planData })); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const fetchAllDynamicPlans = useCallback(() => { if (canManage) return dispatch(fetchDynamicPlans()); return Promise.reject('Unauthorized'); }, [dispatch, canManage]);
    const clearEnterpriseError = useCallback(() => dispatch(clearError()), [dispatch]);
    const resetActiveOverride = useCallback(() => dispatch(clearActiveOverride()), [dispatch]);

    useEffect(() => { if (options.autoFetch && canManage) { fetchAllOverrides({}); fetchAllDynamicPlans(); } }, [options.autoFetch, canManage, fetchAllOverrides, fetchAllDynamicPlans]);

    const getOverrideForTenant = useCallback((tenantId) => overrides.find(o => o.tenant_id === tenantId), [overrides]);
    const getDiscountForTenant = useCallback((tenantId) => { const override = getOverrideForTenant(tenantId); return override?.discount_percentage || 0; }, [getOverrideForTenant]);

    return {
        overrides, dynamicPlans, activeOverride, pagination, loading, error, canManage,
        fetchAllOverrides, addOverride, editOverride, removeOverride, fetchActive, expireAllOverrides,
        addDynamicPlan, editDynamicPlan, fetchAllDynamicPlans, clearEnterpriseError, resetActiveOverride,
        getOverrideForTenant, getDiscountForTenant,
    };
};

export default useEnterprise;
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSubscriptions, fetchSubscriptionById, cancelSubscription, renewSubscription,
    upgradeSubscription, downgradeSubscription, adminCancelTenant,
    setFilters, clearFilters, setPagination, clearSelectedSubscription, clearError,
} from '../../store/billing/slices/subscriptionSlice';
import {
    selectAllSubscriptions, selectSelectedSubscription, selectSubscriptionFilters,
    selectSubscriptionPagination, selectSubscriptionStats, selectSubscriptionsLoading,
    selectSubscriptionsError,
} from '../../store/billing/selectors';

export const useSubscriptions = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const subscriptions = useSelector(selectAllSubscriptions);
    const selectedSubscription = useSelector(selectSelectedSubscription);
    const filters = useSelector(selectSubscriptionFilters);
    const pagination = useSelector(selectSubscriptionPagination);
    const stats = useSelector(selectSubscriptionStats);
    const loading = useSelector(selectSubscriptionsLoading);
    const error = useSelector(selectSubscriptionsError);

    const fetchAll = useCallback((params) => dispatch(fetchSubscriptions(params)), [dispatch]);
    const fetchById = useCallback((id) => dispatch(fetchSubscriptionById(id)), [dispatch]);
    const cancelTenant = useCallback((id, atPeriodEnd = true, reason = '') => dispatch(cancelSubscription({ id, atPeriodEnd, reason })), [dispatch]);
    const adminCancel = useCallback((tenantId, reason) => dispatch(adminCancelTenant({ tenantId, reason })), [dispatch]);
    const renewTenant = useCallback((id, paymentMethodId = null) => dispatch(renewSubscription({ id, paymentMethodId })), [dispatch]);
    const upgradeTenant = useCallback((id, planId, immediate = true) => dispatch(upgradeSubscription({ id, planId, immediate })), [dispatch]);
    const downgradeTenant = useCallback((id, planId, immediate = false) => dispatch(downgradeSubscription({ id, planId, immediate })), [dispatch]);
    const applyFilters = useCallback((newFilters) => dispatch(setFilters(newFilters)), [dispatch]);
    const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);
    const setPage = useCallback((page) => dispatch(setPagination({ page })), [dispatch]);
    const setPageSize = useCallback((pageSize) => dispatch(setPagination({ pageSize, page: 1 })), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedSubscription()), [dispatch]);
    const clearSubscriptionsError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch) fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters }); }, [options.autoFetch, pagination.page, pagination.pageSize, filters, fetchAll]);

    return {
        subscriptions, selectedSubscription, filters, pagination, stats, loading, error,
        fetchAll, fetchById, cancelTenant, adminCancel, renewTenant, upgradeTenant, downgradeTenant,
        applyFilters, resetFilters, setPage, setPageSize, clearSelected, clearSubscriptionsError,
    };
};

export default useSubscriptions;
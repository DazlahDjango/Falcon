import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTenantSubscriptions, fetchTenantInvoices, fetchTenantTransactions,
    fetchRevenueReport, fetchSubscriptionReport, fetchTransactionStats, fetchOverdueInvoices,
    clearTenantData, clearReports,
} from '../../store/billing/slices/adminBillingSlice';
import {
    selectTenantSubscriptions as selectTenantSubs,
    selectTenantInvoices as selectTenantInvs,
    selectTenantTransactions as selectTenantTxns,
    selectAdminRevenueReport as selectRevReport,
    selectSubscriptionReport as selectSubReport,
    selectAdminTransactionStats as selectTxStats,
    selectAdminOverdueInvoices as selectOverdueInvs,
    selectTenantData, selectAdminLoading, selectAdminError,
} from '../../store/billing/selectors';

export const useAdminBilling = () => {
    const dispatch = useDispatch();
    const tenantData = useSelector(selectTenantData) || {};
    const loading = useSelector(selectAdminLoading);
    const error = useSelector(selectAdminError);
    const overdueInvoices = useSelector(selectOverdueInvs);

    const getTenantSubscriptions = useCallback((tenantId) => dispatch(fetchTenantSubscriptions(tenantId)), [dispatch]);
    const getTenantInvoices = useCallback((tenantId) => dispatch(fetchTenantInvoices(tenantId)), [dispatch]);
    const getTenantTransactions = useCallback((tenantId) => dispatch(fetchTenantTransactions(tenantId)), [dispatch]);
    const getRevenueReport = useCallback((year = null) => dispatch(fetchRevenueReport(year)), [dispatch]);
    const getSubscriptionReport = useCallback(() => dispatch(fetchSubscriptionReport()), [dispatch]);
    const getTransactionStats = useCallback((year = null) => dispatch(fetchTransactionStats(year)), [dispatch]);
    const getOverdueInvoices = useCallback(() => dispatch(fetchOverdueInvoices()), [dispatch]);
    const clearTenant = useCallback((tenantId) => dispatch(clearTenantData(tenantId)), [dispatch]);
    const clearAllReports = useCallback(() => dispatch(clearReports()), [dispatch]);

    const selectTenantSubscriptions = useCallback((tenantId) => useSelector((state) => selectTenantSubs(state, tenantId)), []);
    const selectTenantInvoices = useCallback((tenantId) => useSelector((state) => selectTenantInvs(state, tenantId)), []);
    const selectTenantTransactions = useCallback((tenantId) => useSelector((state) => selectTenantTxns(state, tenantId)), []);
    const selectRevenueReport = useCallback(() => useSelector(selectRevReport), []);
    const selectSubscriptionReport = useCallback(() => useSelector(selectSubReport), []);
    const selectTransactionStats = useCallback(() => useSelector(selectTxStats), []);

    return {
        tenantData, loading, error, overdueInvoices,
        getTenantSubscriptions, getTenantInvoices, getTenantTransactions,
        getRevenueReport, getSubscriptionReport, getTransactionStats, getOverdueInvoices,
        clearTenant, clearAllReports,
        selectTenantSubscriptions, selectTenantInvoices, selectTenantTransactions,
        selectRevenueReport, selectSubscriptionReport, selectTransactionStats,
    };
};

export default useAdminBilling;
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTenantSubscriptions, fetchTenantInvoices, fetchTenantTransactions,
    fetchRevenueReport, fetchSubscriptionReport, fetchTaxReport, bulkUpdateSubscriptions,
    clearTenantData, clearReports, resetBulkUpdate,
} from '../../store/billing/slices/adminBillingSlice';
import {
    selectTenantSubscriptions as selectTenantSubs,
    selectTenantInvoices as selectTenantInvs,
    selectTenantTransactions as selectTenantTxns,
    selectRevenueReport as selectRevReport,
    selectSubscriptionReport as selectSubReport,
    selectTaxReport as selectTaxRep,
    selectAdminLoading, selectAdminError, selectBulkUpdateStatus,
} from '../../store/billing/selectors';

export const useAdminBilling = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectAdminLoading);
    const error = useSelector(selectAdminError);
    const bulkUpdateStatus = useSelector(selectBulkUpdateStatus);

    const getTenantSubscriptions = useCallback((tenantId) => dispatch(fetchTenantSubscriptions(tenantId)), [dispatch]);
    const getTenantInvoices = useCallback((tenantId) => dispatch(fetchTenantInvoices(tenantId)), [dispatch]);
    const getTenantTransactions = useCallback((tenantId) => dispatch(fetchTenantTransactions(tenantId)), [dispatch]);
    const getRevenueReport = useCallback((startDate, endDate) => dispatch(fetchRevenueReport({ startDate, endDate })), [dispatch]);
    const getSubscriptionReport = useCallback((startDate, endDate) => dispatch(fetchSubscriptionReport({ startDate, endDate })), [dispatch]);
    const getTaxReport = useCallback((year) => dispatch(fetchTaxReport(year)), [dispatch]);
    const bulkUpdate = useCallback((updates) => dispatch(bulkUpdateSubscriptions(updates)), [dispatch]);
    const clearTenant = useCallback((tenantId) => dispatch(clearTenantData(tenantId)), [dispatch]);
    const clearAllReports = useCallback(() => dispatch(clearReports()), [dispatch]);
    const resetBulk = useCallback(() => dispatch(resetBulkUpdate()), [dispatch]);

    const selectTenantSubscriptions = useCallback((tenantId) => useSelector((state) => selectTenantSubs(state, tenantId)), []);
    const selectTenantInvoices = useCallback((tenantId) => useSelector((state) => selectTenantInvs(state, tenantId)), []);
    const selectTenantTransactions = useCallback((tenantId) => useSelector((state) => selectTenantTxns(state, tenantId)), []);
    const selectRevenueReport = useCallback(() => useSelector(selectRevReport), []);
    const selectSubscriptionReport = useCallback(() => useSelector(selectSubReport), []);
    const selectTaxReport = useCallback(() => useSelector(selectTaxRep), []);

    return {
        loading, error, bulkUpdateStatus,
        getTenantSubscriptions, getTenantInvoices, getTenantTransactions,
        getRevenueReport, getSubscriptionReport, getTaxReport, bulkUpdate,
        clearTenant, clearAllReports, resetBulk,
        selectTenantSubscriptions, selectTenantInvoices, selectTenantTransactions,
        selectRevenueReport, selectSubscriptionReport, selectTaxReport,
    };
};

export default useAdminBilling;
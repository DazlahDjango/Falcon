import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditSummary, exportAuditLogs, setFilters, clearFilters, setPagination, clearError } from '../../store/billing/slices/auditSlice';
import { selectAuditLogs, selectAuditSummary, selectAuditPagination, selectAuditFilters, selectAuditLoading, selectAuditError, selectAuditExporting, selectAuditSummaryStats } from '../../store/billing/selectors';
import { useBillingPermissions } from './useBillingPermissions';

export const useAudit = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const { permissions } = useBillingPermissions();
    const logs = useSelector(selectAuditLogs) || [];
    const summary = useSelector(selectAuditSummary);
    const pagination = useSelector(selectAuditPagination) || { page: 1, pageSize: 20, total: 0 };
    const filters = useSelector(selectAuditFilters) || {};
    const loading = useSelector(selectAuditLoading);
    const error = useSelector(selectAuditError);
    const exporting = useSelector(selectAuditExporting);
    const stats = useSelector(selectAuditSummaryStats);
    const canView = permissions.canViewAnalytics || permissions.canManageSubscriptions;
    const hasFetched = useRef(false);
    const hasFetchedSummary = useRef(false);

    const fetchLogs = useCallback((params) => { if (canView) return dispatch(fetchAuditLogs(params)); return Promise.reject('Unauthorized'); }, [dispatch, canView]);
    const fetchSummary = useCallback(() => { if (!canView) return Promise.reject('Unauthorized'); if (hasFetchedSummary.current) return Promise.resolve(); hasFetchedSummary.current = true; return dispatch(fetchAuditSummary()); }, [dispatch, canView]);
    const exportLogs = useCallback((days = 30, format = 'csv') => { if (canView) return dispatch(exportAuditLogs({ days, format })); return Promise.reject('Unauthorized'); }, [dispatch, canView]);
    const applyFilters = useCallback((newFilters) => { 
        dispatch(setFilters(newFilters)); 
        const pageSize = pagination?.pageSize || 20;
        fetchLogs({ page: 1, pageSize, filters: { ...filters, ...newFilters } }); 
    }, [dispatch, filters, pagination?.pageSize, fetchLogs]);
    
    const resetAuditFilters = useCallback(() => { 
        dispatch(clearFilters()); 
        const pageSize = pagination?.pageSize || 20;
        fetchLogs({ page: 1, pageSize, filters: {} }); 
    }, [dispatch, pagination?.pageSize, fetchLogs]);
    
    const setPage = useCallback((page) => { 
        dispatch(setPagination({ page })); 
        const pageSize = pagination?.pageSize || 20;
        fetchLogs({ page, pageSize, filters }); 
    }, [dispatch, pagination?.pageSize, filters, fetchLogs]);
    
    const setPageSize = useCallback((pageSize) => { 
        dispatch(setPagination({ pageSize, page: 1 })); 
        fetchLogs({ page: 1, pageSize, filters }); 
    }, [dispatch, filters, fetchLogs]);
    
    const clearAuditError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && canView && !hasFetched.current) {
            hasFetched.current = true;
            const page = pagination?.page || 1;
            const pageSize = pagination?.pageSize || 20;
            fetchLogs({ page, pageSize, filters }); 
        }
    }, [options.autoFetch, canView]);

    const getLogsByAction = useCallback((action) => (logs || []).filter(l => l.action === action), [logs]);
    const getLogsByResource = useCallback((resourceType) => (logs || []).filter(l => l.resource_type === resourceType), [logs]);
    const getLogsByUser = useCallback((userEmail) => (logs || []).filter(l => l.user_email === userEmail), [logs]);
    const getFailedLogs = useCallback(() => (logs || []).filter(l => !l.success), [logs]);

    return {
        logs, summary, pagination, filters, loading, error, exporting, stats, canView,
        fetchLogs, fetchSummary, exportLogs, applyFilters, resetAuditFilters, setPage, setPageSize, clearAuditError,
        getLogsByAction, getLogsByResource, getLogsByUser, getFailedLogs,
    };
};

export default useAudit;
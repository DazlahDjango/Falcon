import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAuditLogs,
    fetchAuditLogById,
    fetchUserAuditActivity,
    fetchUserAuditSummary,
    fetchTenantAuditSummary,
    fetchSecurityEvents,
    fetchObjectHistory,
    fetchComplianceReport,
    exportAuditLogs,
    setFilters,
    resetFilters,
    setPage,
    clearSelectedLog,
    clearError,
    resetAudit,
    selectAudit,
    selectAuditLogs,
    selectSelectedLog,
    selectAuditPagination,
    selectAuditFilters,
    selectSecurityEvents,
    selectComplianceReport,
    selectAuditLoading,
    selectAuditError,
} from '../../store/accounts/slice/auditSlice';

export const useAudit = () => {
    const dispatch = useDispatch();
    const auditState = useSelector(selectAudit);

    // Local UI state
    const [exportFormat, setExportFormat] = useState('json');
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: '',
    });
    const [selectedEventType, setSelectedEventType] = useState('');

    // ========== Data Fetching ==========

    const loadAuditLogs = useCallback(async (params = {}) => {
        return await dispatch(fetchAuditLogs(params)).unwrap();
    }, [dispatch]);

    const loadAuditLogById = useCallback(async (logId) => {
        return await dispatch(fetchAuditLogById(logId)).unwrap();
    }, [dispatch]);

    const loadUserAuditActivity = useCallback(async (userId, days = 30) => {
        return await dispatch(fetchUserAuditActivity({ userId, days })).unwrap();
    }, [dispatch]);

    const loadUserAuditSummary = useCallback(async (days = 30) => {
        return await dispatch(fetchUserAuditSummary(days)).unwrap();
    }, [dispatch]);

    const loadTenantAuditSummary = useCallback(async (days = 30) => {
        return await dispatch(fetchTenantAuditSummary(days)).unwrap();
    }, [dispatch]);

    const loadSecurityEvents = useCallback(async (days = 30) => {
        return await dispatch(fetchSecurityEvents(days)).unwrap();
    }, [dispatch]);

    const loadObjectHistory = useCallback(async (contentType, objectId) => {
        return await dispatch(fetchObjectHistory({ contentType, objectId })).unwrap();
    }, [dispatch]);

    const loadComplianceReport = useCallback(async (startDate, endDate) => {
        return await dispatch(fetchComplianceReport({ startDate, endDate })).unwrap();
    }, [dispatch]);

    const exportLogs = useCallback(async (data) => {
        return await dispatch(exportAuditLogs(data)).unwrap();
    }, [dispatch]);

    // ========== Filters & Pagination ==========

    const updateAuditFilters = useCallback((filters) => {
        dispatch(setFilters(filters));
    }, [dispatch]);

    const clearAuditFilters = useCallback(() => {
        dispatch(resetFilters());
    }, [dispatch]);

    const goToAuditPage = useCallback((page) => {
        dispatch(setPage(page));
    }, [dispatch]);

    // ========== Date Range Helpers ==========

    const setDateRangeFilter = useCallback((startDate, endDate) => {
        setDateRange({ start_date: startDate, end_date: endDate });
        updateAuditFilters({ start_date: startDate, end_date: endDate });
    }, [updateAuditFilters]);

    const getLastNDays = useCallback((days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        const formatDate = (date) => date.toISOString().split('T')[0];

        setDateRangeFilter(formatDate(start), formatDate(end));
    }, [setDateRangeFilter]);

    // ========== Utilities ==========

    const clearAuditError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const clearAuditSelection = useCallback(() => {
        dispatch(clearSelectedLog());
    }, [dispatch]);

    const resetAuditState = useCallback(() => {
        dispatch(resetAudit());
    }, [dispatch]);

    // ========== Computed Values ==========

    const getSeverityBadge = (severity) => {
        const badges = {
            info: { text: 'Info', variant: 'info' },
            warning: { text: 'Warning', variant: 'warning' },
            error: { text: 'Error', variant: 'danger' },
            critical: { text: 'Critical', variant: 'critical' },
        };
        return badges[severity] || badges.info;
    };

    const getActionTypeLabel = (actionType) => {
        const labels = {
            create: 'Create',
            read: 'Read',
            update: 'Update',
            delete: 'Delete',
            login: 'Login',
            logout: 'Logout',
            approve: 'Approve',
            reject: 'Reject',
            export: 'Export',
            security: 'Security',
        };
        return labels[actionType] || actionType;
    };

    // ========== Return ==========

    return {
        // State
        logs: auditState.logs,
        selectedLog: auditState.selectedLog,
        pagination: auditState.pagination,
        filters: auditState.filters,
        userActivity: auditState.userActivity,
        userSummary: auditState.userSummary,
        tenantSummary: auditState.tenantSummary,
        securityEvents: auditState.securityEvents,
        objectHistory: auditState.objectHistory,
        complianceReport: auditState.complianceReport,
        isLoading: auditState.isLoading,
        error: auditState.error,
        exporting: auditState.exporting,

        // UI State
        exportFormat,
        setExportFormat,
        dateRange,
        selectedEventType,
        setSelectedEventType,

        // Actions - Data Fetching
        loadAuditLogs,
        loadAuditLogById,
        loadUserAuditActivity,
        loadUserAuditSummary,
        loadTenantAuditSummary,
        loadSecurityEvents,
        loadObjectHistory,
        loadComplianceReport,
        exportLogs,

        // Actions - Filters
        updateAuditFilters,
        clearAuditFilters,
        goToAuditPage,

        // Actions - Date Helpers
        setDateRangeFilter,
        getLastNDays,

        // Utilities
        clearAuditError,
        clearAuditSelection,
        resetAuditState,

        // Computed Values
        getSeverityBadge,
        getActionTypeLabel,
    };
};
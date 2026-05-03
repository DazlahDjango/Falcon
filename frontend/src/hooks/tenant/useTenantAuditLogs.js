// frontend/src/hooks/tenant/useTenantAuditLogs.js
import { useState, useEffect, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenantAuditLogs = (tenantId) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState({});

    // Fetch audit logs
    const fetchAuditLogs = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...filters,
            };

            const response = await TenantService.getTenantAuditLogs(tenantId, params);
            if (response.success) {
                const items = response.data.results || response.data;
                const totalCount = response.data.count || items.length;

                setLogs(items);
                setTotal(totalCount);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [tenantId, page, pageSize, filters]);

    // Filter by date range
    const filterByDateRange = useCallback((startDate, endDate) => {
        setFilters(prev => ({
            ...prev,
            start_date: startDate,
            end_date: endDate,
        }));
        setPage(1);
    }, []);

    // Filter by action type
    const filterByAction = useCallback((action) => {
        if (action) {
            setFilters(prev => ({ ...prev, action }));
        } else {
            const { action: _, ...rest } = filters;
            setFilters(rest);
        }
        setPage(1);
    }, [filters]);

    // Filter by user
    const filterByUser = useCallback((userId) => {
        if (userId) {
            setFilters(prev => ({ ...prev, user_id: userId }));
        } else {
            const { user_id, ...rest } = filters;
            setFilters(rest);
        }
        setPage(1);
    }, [filters]);

    // Filter by resource type
    const filterByResource = useCallback((resourceType) => {
        if (resourceType) {
            setFilters(prev => ({ ...prev, resource_type: resourceType }));
        } else {
            const { resource_type, ...rest } = filters;
            setFilters(rest);
        }
        setPage(1);
    }, [filters]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
    }, []);

    // Change page
    const goToPage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    // Change page size
    const setItemsPerPage = useCallback((newSize) => {
        setPageSize(newSize);
        setPage(1);
    }, []);

    // Export logs
    const exportLogs = useCallback(async (format = 'csv') => {
        if (!tenantId) return null;

        try {
            const params = { ...filters };
            const blob = await TenantService.exportData(format, {
                tenant_id: tenantId,
                type: 'audit',
                ...params
            });
            return blob;
        } catch (err) {
            console.error('Failed to export logs:', err);
            return null;
        }
    }, [tenantId, filters]);

    // Get unique actions from logs
    const getUniqueActions = useCallback(() => {
        const actions = new Set();
        logs.forEach(log => {
            if (log.action) actions.add(log.action);
        });
        return Array.from(actions);
    }, [logs]);

    // Get unique resources from logs
    const getUniqueResources = useCallback(() => {
        const resources = new Set();
        logs.forEach(log => {
            if (log.resource) resources.add(log.resource);
        });
        return Array.from(resources);
    }, [logs]);

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    return {
        // Data
        logs,
        loading,
        error,
        total,
        page,
        pageSize,
        totalPages,
        filters,

        // Navigation
        goToPage,
        setItemsPerPage,
        hasNextPage,
        hasPrevPage,

        // Filtering
        filterByDateRange,
        filterByAction,
        filterByUser,
        filterByResource,
        clearFilters,

        // Actions
        refresh: fetchAuditLogs,
        exportLogs,

        // Helpers
        getUniqueActions,
        getUniqueResources,
    };
};
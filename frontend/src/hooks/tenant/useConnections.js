import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConnections,
    fetchTenantConnections,
    fetchConnectionDetails,
    fetchConnectionMetrics,
    performHealthCheck,
    updateConnectionStatus,
    closeConnection,
    executeManagerAction,
    closeIdleConnections,
    setConnectionFilters,
    clearConnectionFilters,
    setConnectionPage,
    setConnectionPageSize,
    updateRealtimeData,
    batchUpdateHealthStatus,
} from '../../store/tenant/slice/connectionSlice';
import {
    selectConnections,
    selectCurrentConnection,
    selectMetrics,
    selectHealthStatus,
    selectFilters,
    selectPagination,
    selectLoading,
    selectError,
    selectFilteredConnections,
    selectConnectionsByStatus,
    selectConnectionStats,
    selectHealthSummary,
    selectIsStale,
} from '../../store/tenant/slice/connectionSelectors';
import { connectionService } from '../../services/tenant/connection.service';

/**
 * Hook for managing connection list with auto-refresh
 */
export const useConnections = (options = {}) => {
    const {
        autoRefresh = false,
        refreshInterval = 30000,
        tenantId = null,
    } = options;

    const dispatch = useDispatch();
    const connections = useSelector(selectConnections) || [];
    const filteredConnections = useSelector(selectFilteredConnections) || [];
    const stats = useSelector(selectConnectionsByStatus) || {
        active: 0,
        idle: 0,
        closed: 0,
        errored: 0
    };
    const metrics = useSelector(selectMetrics) || {
        total_connections: 0,
        active_connections: 0,
        connection_rate: 0,
        avg_response_time: 0
    };
    const filters = useSelector(selectFilters) || {};
    const pagination = useSelector(selectPagination) || { page: 1, page_size: 20, total: 0 };
    const loading = useSelector(selectLoading) || false;
    const error = useSelector(selectError);
    const isStale = useSelector(selectIsStale) || false;

    const refreshTimer = useRef(null);
    const mounted = useRef(true);

    const loadConnections = useCallback(async () => {
        if (!mounted.current) return;

        try {
            if (tenantId) {
                await dispatch(fetchTenantConnections({ tenantId, params: filters }));
            } else {
                await dispatch(fetchConnections(filters));
            }
        } catch (err) {
            console.error('Failed to load connections:', err);
        }
    }, [dispatch, tenantId, filters]);

    const loadMetrics = useCallback(async () => {
        if (!mounted.current) return;

        try {
            await dispatch(fetchConnectionMetrics(filters));
        } catch (err) {
            console.error('Failed to load metrics:', err);
        }
    }, [dispatch, filters]);

    const refresh = useCallback(async () => {
        await Promise.allSettled([loadConnections(), loadMetrics()]);
    }, [loadConnections, loadMetrics]);

    useEffect(() => {
        if (autoRefresh && mounted.current) {
            refresh();
            refreshTimer.current = setInterval(refresh, refreshInterval);
        }

        return () => {
            if (refreshTimer.current) {
                clearInterval(refreshTimer.current);
            }
            mounted.current = false;
        };
    }, [autoRefresh, refresh, refreshInterval]);

    useEffect(() => {
        if (mounted.current) {
            loadConnections();
        }
    }, [filters.page, filters.page_size]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setConnectionFilters(newFilters));
    }, [dispatch]);

    const resetFilters = useCallback(() => {
        dispatch(clearConnectionFilters());
    }, [dispatch]);

    const changePage = useCallback((page) => {
        dispatch(setConnectionPage(page));
    }, [dispatch]);

    const changePageSize = useCallback((pageSize) => {
        dispatch(setConnectionPageSize(pageSize));
    }, [dispatch]);

    const healthCheck = useCallback(async (targetTenantId) => {
        if (!targetTenantId) {
            console.warn('No tenant ID provided for health check');
            return null;
        }

        try {
            const result = await dispatch(performHealthCheck(targetTenantId));
            return result.payload;
        } catch (err) {
            console.error(`Health check failed for tenant ${targetTenantId}:`, err);
            return null;
        }
    }, [dispatch]);

    return {
        connections,
        filteredConnections,
        stats,
        metrics,
        filters,
        pagination,
        loading,
        error,
        isStale,
        refresh,
        updateFilters,
        resetFilters,
        changePage,
        changePageSize,
        healthCheck,
    };
};

/**
 * Hook for managing single connection
 */
export const useConnection = (connectionId) => {
    const dispatch = useDispatch();
    const connection = useSelector(selectCurrentConnection);
    const loading = useSelector(selectLoading) || false;
    const error = useSelector(selectError);

    const loadConnection = useCallback(async () => {
        if (connectionId) {
            try {
                await dispatch(fetchConnectionDetails(connectionId));
            } catch (err) {
                console.error(`Failed to load connection ${connectionId}:`, err);
            }
        }
    }, [dispatch, connectionId]);

    const updateStatus = useCallback(async (status, errorMessage = '') => {
        if (!connectionId) return null;

        try {
            const result = await dispatch(updateConnectionStatus({
                connectionId,
                statusData: { status, error_message: errorMessage },
            }));
            return result.payload;
        } catch (err) {
            console.error(`Failed to update status for connection ${connectionId}:`, err);
            return null;
        }
    }, [dispatch, connectionId]);

    const close = useCallback(async () => {
        if (!connectionId) return null;

        try {
            const result = await dispatch(closeConnection(connectionId));
            return result.payload;
        } catch (err) {
            console.error(`Failed to close connection ${connectionId}:`, err);
            return null;
        }
    }, [dispatch, connectionId]);

    const getRealtimeStatus = useCallback(async () => {
        if (!connectionId) return null;

        try {
            const result = await connectionService.getConnectionStatus(connectionId);
            if (result.success && result.data?.manager_status) {
                dispatch(updateRealtimeData({
                    connectionId,
                    data: result.data.manager_status,
                }));
            }
            return result;
        } catch (err) {
            console.error(`Failed to get realtime status for connection ${connectionId}:`, err);
            return null;
        }
    }, [dispatch, connectionId]);

    useEffect(() => {
        if (connectionId) {
            loadConnection();
        }
    }, [connectionId, loadConnection]);

    return {
        connection,
        loading,
        error,
        loadConnection,
        updateStatus,
        close,
        getRealtimeStatus,
    };
};

/**
 * Hook for connection manager operations (admin only)
 */
export const useConnectionManager = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectLoading) || false;
    const healthSummary = useSelector(selectHealthSummary) || {
        healthy: 0,
        unhealthy: 0,
        avg_response_time: 0,
        total_checked: 0,
        last_check: null
    };
    const stats = useSelector(selectConnectionStats) || {
        total_connections: 0,
        active_connections: 0,
        idle_connections: 0,
        connection_rate: 0
    };

    const closeTenantConnection = useCallback(async (tenantId) => {
        if (!tenantId) return null;

        try {
            const result = await dispatch(executeManagerAction({
                action: 'close',
                tenant_id: tenantId,
            }));
            return result.payload;
        } catch (err) {
            console.error(`Failed to close connection for tenant ${tenantId}:`, err);
            return null;
        }
    }, [dispatch]);

    const resetTenantConnection = useCallback(async (tenantId) => {
        if (!tenantId) return null;

        try {
            const result = await dispatch(executeManagerAction({
                action: 'reset',
                tenant_id: tenantId,
            }));
            return result.payload;
        } catch (err) {
            console.error(`Failed to reset connection for tenant ${tenantId}:`, err);
            return null;
        }
    }, [dispatch]);

    const recycleAllConnections = useCallback(async () => {
        try {
            const result = await dispatch(executeManagerAction({
                action: 'recycle',
            }));
            return result.payload;
        } catch (err) {
            console.error('Failed to recycle all connections:', err);
            return null;
        }
    }, [dispatch]);

    const closeIdle = useCallback(async (idleMinutes = 30) => {
        try {
            const result = await dispatch(closeIdleConnections(idleMinutes));
            return result.payload;
        } catch (err) {
            console.error(`Failed to close idle connections (${idleMinutes} mins):`, err);
            return null;
        }
    }, [dispatch]);

    const getHealthCheck = useCallback(async (tenantId) => {
        if (!tenantId) return null;

        try {
            const result = await dispatch(performHealthCheck(tenantId));
            return result.payload;
        } catch (err) {
            console.error(`Health check failed for tenant ${tenantId}:`, err);
            return null;
        }
    }, [dispatch]);

    const bulkHealthCheck = useCallback(async (tenantIds) => {
        if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            console.warn('No tenant IDs provided for bulk health check');
            return [];
        }

        try {
            const response = await connectionService.batchHealthCheck(tenantIds);
            if (response.success && response.data && Array.isArray(response.data)) {
                dispatch(batchUpdateHealthStatus(response.data));
                return response.data;
            }
            return [];
        } catch (err) {
            console.error('Batch health check failed:', err);

            const results = [];
            for (const tenantId of tenantIds) {
                try {
                    const result = await dispatch(performHealthCheck(tenantId));
                    if (result.payload) {
                        results.push(result.payload);
                    }
                } catch (error) {
                    console.error(`Health check failed for tenant ${tenantId}:`, error);
                    results.push({
                        tenant_id: tenantId,
                        is_healthy: false,
                        error_message: error.message,
                        response_time_ms: null,
                        last_successful_check: null
                    });
                }
            }
            return results;
        }
    }, [dispatch]);

    return {
        closeTenantConnection,
        resetTenantConnection,
        recycleAllConnections,
        closeIdle,
        getHealthCheck,
        bulkHealthCheck,
        healthSummary,
        stats,
        loading,
    };
};

/**
 * Hook for connection monitoring and real-time updates
 */
export const useConnectionMonitor = (connectionIds = [], interval = 5000) => {
    const dispatch = useDispatch();
    const timer = useRef(null);
    const mounted = useRef(true);

    const updateStatuses = useCallback(async () => {
        if (!mounted.current || !connectionIds || connectionIds.length === 0) return;

        for (const connectionId of connectionIds) {
            try {
                const response = await connectionService.getConnectionStatus(connectionId);
                if (response.success && response.data?.manager_status) {
                    dispatch(updateRealtimeData({
                        connectionId,
                        data: response.data.manager_status,
                    }));
                }
            } catch (error) {
                console.error(`Failed to fetch status for connection ${connectionId}:`, error);
            }
        }
    }, [dispatch, connectionIds]);

    useEffect(() => {
        if (connectionIds && connectionIds.length > 0 && mounted.current) {
            updateStatuses();
            timer.current = setInterval(updateStatuses, interval);
        }

        return () => {
            if (timer.current) {
                clearInterval(timer.current);
            }
            mounted.current = false;
        };
    }, [connectionIds, interval, updateStatuses]);

    return { isMonitoring: !!timer.current };
};

/**
 * Hook for connection health dashboard with proper safety checks
 */
export const useHealthDashboard = () => {
    const dispatch = useDispatch();

    const healthStatus = useSelector(selectHealthStatus) || {};
    const healthSummary = useSelector(selectHealthSummary) || {
        healthy: 0,
        unhealthy: 0,
        avg_response_time: 0,
        total_checked: 0,
        last_check: null
    };
    const loading = useSelector(selectLoading) || false;
    const stats = useSelector(selectConnectionStats) || {};

    const [checkingTenants, setCheckingTenants] = useState(new Set());
    const [checkErrors, setCheckErrors] = useState({});

    const getUnhealthyTenants = useCallback(() => {
        if (!healthStatus || typeof healthStatus !== 'object') {
            return [];
        }
        try {
            return Object.values(healthStatus).filter(h => h && !h.is_healthy);
        } catch (err) {
            console.error('Error getting unhealthy tenants:', err);
            return [];
        }
    }, [healthStatus]);

    const getHealthyTenants = useCallback(() => {
        if (!healthStatus || typeof healthStatus !== 'object') {
            return [];
        }
        try {
            return Object.values(healthStatus).filter(h => h && h.is_healthy);
        } catch (err) {
            console.error('Error getting healthy tenants:', err);
            return [];
        }
    }, [healthStatus]);

    const checkAllTenants = useCallback(async (tenantIds) => {
        if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            console.warn('No tenant IDs provided for health check');
            return [];
        }

        const checkingSet = new Set(tenantIds);
        setCheckingTenants(checkingSet);

        try {
            const response = await connectionService.batchHealthCheck(tenantIds);

            if (response.success && response.data && Array.isArray(response.data)) {
                dispatch(batchUpdateHealthStatus(response.data));
                return response.data;
            }

            return [];
        } catch (error) {
            console.error('Batch health check failed:', error);
            return [];
        } finally {
            setCheckingTenants(new Set());
            setTimeout(() => setCheckErrors({}), 5000);
        }
    }, [dispatch]);

    const checkTenant = useCallback(async (tenantId) => {
        if (!tenantId) {
            console.warn('No tenant ID provided for health check');
            return null;
        }

        setCheckingTenants(prev => new Set([...prev, tenantId]));

        try {
            const result = await dispatch(performHealthCheck(tenantId)).unwrap();
            return result;
        } catch (err) {
            console.error(`Health check failed for tenant ${tenantId}:`, err);
            setCheckErrors(prev => ({
                ...prev,
                [tenantId]: err.message
            }));
            return {
                tenant_id: tenantId,
                is_healthy: false,
                error_message: err.message,
                response_time_ms: null,
                last_successful_check: null
            };
        } finally {
            setCheckingTenants(prev => {
                const newSet = new Set(prev);
                newSet.delete(tenantId);
                return newSet;
            });
            setTimeout(() => {
                setCheckErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[tenantId];
                    return newErrors;
                });
            }, 5000);
        }
    }, [dispatch]);

    const getTenantHealth = useCallback((tenantId) => {
        if (!healthStatus || !tenantId) return null;
        return healthStatus[tenantId] || null;
    }, [healthStatus]);

    const isTenantHealthy = useCallback((tenantId) => {
        if (!healthStatus || !tenantId) return false;
        return healthStatus[tenantId]?.is_healthy || false;
    }, [healthStatus]);

    const isChecking = useCallback((tenantId) => {
        return checkingTenants.has(tenantId);
    }, [checkingTenants]);

    const getCheckError = useCallback((tenantId) => {
        return checkErrors[tenantId] || null;
    }, [checkErrors]);

    const getHealthPercentage = useCallback(() => {
        const total = (healthSummary?.healthy || 0) + (healthSummary?.unhealthy || 0);
        if (total === 0) return 0;
        return ((healthSummary?.healthy || 0) / total) * 100;
    }, [healthSummary]);

    return {
        healthStatus,
        healthSummary,
        loading,
        stats,
        checkAllTenants,
        checkTenant,
        getUnhealthyTenants,
        getHealthyTenants,
        getTenantHealth,
        isTenantHealthy,
        isChecking,
        getCheckError,
        getHealthPercentage,
        hasUnhealthy: getUnhealthyTenants().length > 0,
        totalChecked: Object.keys(healthStatus).length,
        healthyCount: healthSummary?.healthy || 0,
        unhealthyCount: healthSummary?.unhealthy || 0,
    };
};
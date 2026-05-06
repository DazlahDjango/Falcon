// frontend/src/hooks/useConnections.js
import { useEffect, useCallback, useRef } from 'react';
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
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    updateRealtimeData,
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
        refreshInterval = 30000, // 30 seconds
        tenantId = null,
    } = options;

    const dispatch = useDispatch();
    const connections = useSelector(selectConnections);
    const filteredConnections = useSelector(selectFilteredConnections);
    const stats = useSelector(selectConnectionsByStatus);
    const metrics = useSelector(selectMetrics);
    const filters = useSelector(selectFilters);
    const pagination = useSelector(selectPagination);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const isStale = useSelector(selectIsStale);
    
    const refreshTimer = useRef(null);
    const mounted = useRef(true);

    const loadConnections = useCallback(async () => {
        if (tenantId) {
            await dispatch(fetchTenantConnections({ tenantId, params: filters }));
        } else {
            await dispatch(fetchConnections(filters));
        }
    }, [dispatch, tenantId, filters]);

    const loadMetrics = useCallback(async () => {
        await dispatch(fetchConnectionMetrics(filters));
    }, [dispatch, filters]);

    const refresh = useCallback(async () => {
        await Promise.all([loadConnections(), loadMetrics()]);
    }, [loadConnections, loadMetrics]);

    // Auto-refresh setup
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

    // Manual refresh when filters change
    useEffect(() => {
        if (mounted.current) {
            loadConnections();
        }
    }, [filters.page, filters.page_size]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);

    const resetFilters = useCallback(() => {
        dispatch(clearFilters());
    }, [dispatch]);

    const changePage = useCallback((page) => {
        dispatch(setPage(page));
    }, [dispatch]);

    const changePageSize = useCallback((pageSize) => {
        dispatch(setPageSize(pageSize));
    }, [dispatch]);

    const healthCheck = useCallback(async (targetTenantId) => {
        const result = await dispatch(performHealthCheck(targetTenantId));
        return result.payload;
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
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const loadConnection = useCallback(async () => {
        if (connectionId) {
            await dispatch(fetchConnectionDetails(connectionId));
        }
    }, [dispatch, connectionId]);

    const updateStatus = useCallback(async (status, errorMessage = '') => {
        const result = await dispatch(updateConnectionStatus({
            connectionId,
            statusData: { status, error_message: errorMessage },
        }));
        return result.payload;
    }, [dispatch, connectionId]);

    const close = useCallback(async () => {
        const result = await dispatch(closeConnection(connectionId));
        return result.payload;
    }, [dispatch, connectionId]);

    const getRealtimeStatus = useCallback(async () => {
        const result = await connectionService.getConnectionStatus(connectionId);
        if (result.success) {
            dispatch(updateRealtimeData({
                connectionId,
                data: result.data.manager_status,
            }));
        }
        return result;
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
    const loading = useSelector(selectLoading);
    const healthSummary = useSelector(selectHealthSummary);
    const stats = useSelector(selectConnectionStats);

    const closeTenantConnection = useCallback(async (tenantId) => {
        const result = await dispatch(executeManagerAction({
            action: 'close',
            tenant_id: tenantId,
        }));
        return result.payload;
    }, [dispatch]);

    const resetTenantConnection = useCallback(async (tenantId) => {
        const result = await dispatch(executeManagerAction({
            action: 'reset',
            tenant_id: tenantId,
        }));
        return result.payload;
    }, [dispatch]);

    const recycleAllConnections = useCallback(async () => {
        const result = await dispatch(executeManagerAction({
            action: 'recycle',
        }));
        return result.payload;
    }, [dispatch]);

    const closeIdle = useCallback(async (idleMinutes = 30) => {
        const result = await dispatch(closeIdleConnections(idleMinutes));
        return result.payload;
    }, [dispatch]);

    const getHealthCheck = useCallback(async (tenantId) => {
        const result = await dispatch(performHealthCheck(tenantId));
        return result.payload;
    }, [dispatch]);

    const bulkHealthCheck = useCallback(async (tenantIds) => {
        const results = await Promise.all(
            tenantIds.map(tenantId => getHealthCheck(tenantId))
        );
        return results;
    }, [getHealthCheck]);

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
        if (!mounted.current) return;
        
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
        if (connectionIds.length > 0 && mounted.current) {
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
 * Hook for connection health dashboard
 */
export const useHealthDashboard = () => {
    const dispatch = useDispatch();
    const healthStatus = useSelector(selectHealthStatus);
    const healthSummary = useSelector(selectHealthSummary);
    const loading = useSelector(selectLoading);
    const stats = useSelector(selectConnectionStats);

    const checkAllTenants = useCallback(async (tenantIds) => {
        const results = [];
        for (const tenantId of tenantIds) {
            const result = await dispatch(performHealthCheck(tenantId));
            if (result.payload) {
                results.push(result.payload);
            }
        }
        return results;
    }, [dispatch]);

    const checkTenant = useCallback(async (tenantId) => {
        const result = await dispatch(performHealthCheck(tenantId));
        return result.payload;
    }, [dispatch]);

    const getUnhealthyTenants = useCallback(() => {
        return Object.values(healthStatus).filter(h => !h.is_healthy);
    }, [healthStatus]);

    const getHealthyTenants = useCallback(() => {
        return Object.values(healthStatus).filter(h => h.is_healthy);
    }, [healthStatus]);

    return {
        healthStatus,
        healthSummary,
        loading,
        stats,
        checkAllTenants,
        checkTenant,
        getUnhealthyTenants,
        getHealthyTenants,
    };
};
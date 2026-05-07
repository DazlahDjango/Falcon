// frontend/src/store/tenant/slice/connectionSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base selectors (exported as named exports)
export const selectConnectionsState = (state) => state.connections || {};
export const selectConnections = (state) => state.connections?.connections || [];
export const selectCurrentConnection = (state) => state.connections?.currentConnection;
export const selectMetrics = (state) => state.connections?.metrics;
export const selectHealthStatus = (state) => state.connections?.healthStatus;
export const selectFilters = (state) => state.connections?.filters || {};
export const selectPagination = (state) => state.connections?.pagination || {};
export const selectLoading = (state) => state.connections?.loading || false;
export const selectError = (state) => state.connections?.error;
export const selectLastUpdated = (state) => state.connections?.lastUpdated;

// Filtered connections
export const selectFilteredConnections = createSelector(
    [selectConnections, selectFilters],
    (connections, filters) => {
        let filtered = [...connections];

        if (filters.status) {
            filtered = filtered.filter(conn => conn.status === filters.status);
        }

        if (filters.tenant_id) {
            filtered = filtered.filter(conn => conn.tenant_id === filters.tenant_id);
        }

        if (filters.is_active !== null && filters.is_active !== undefined) {
            filtered = filtered.filter(conn => conn.is_active === filters.is_active);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(conn =>
                conn.connection_id?.toLowerCase().includes(searchLower) ||
                conn.tenant_name?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }
);

// Connections by status
export const selectConnectionsByStatus = createSelector(
    [selectConnections],
    (connections) => ({
        active: connections.filter(c => c.status === 'active').length,
        idle: connections.filter(c => c.status === 'idle').length,
        closed: connections.filter(c => c.status === 'closed').length,
        error: connections.filter(c => c.status === 'error').length,
        total: connections.length,
    })
);

// Connection statistics
export const selectConnectionStats = createSelector(
    [selectConnections, selectMetrics],
    (connections, metrics) => {
        if (metrics) {
            return metrics;
        }

        const stats = {
            total_connections: connections.length,
            active_connections: connections.filter(c => c.status === 'active').length,
            idle_connections: connections.filter(c => c.status === 'idle').length,
            error_connections: connections.filter(c => c.status === 'error').length,
            closed_connections: connections.filter(c => c.status === 'closed').length,
            avg_connection_duration_seconds: null,
            max_concurrent_connections: 0,
            connections_last_hour: 0,
            connections_last_24h: 0,
        };

        const activeWithDuration = connections.filter(c => c.idle_duration_seconds);
        if (activeWithDuration.length > 0) {
            const totalDuration = activeWithDuration.reduce((sum, c) => sum + (c.idle_duration_seconds || 0), 0);
            stats.avg_connection_duration_seconds = totalDuration / activeWithDuration.length;
        }

        return stats;
    }
);

// Health summary
export const selectHealthSummary = createSelector(
    [selectHealthStatus],
    (healthStatus) => {
        const statuses = Object.values(healthStatus || {});
        return {
            total: statuses.length,
            healthy: statuses.filter(s => s?.is_healthy).length,
            unhealthy: statuses.filter(s => !s?.is_healthy).length,
            average_response_ms: statuses.length > 0
                ? statuses.reduce((sum, s) => sum + (s?.response_time_ms || 0), 0) / statuses.length
                : 0,
        };
    }
);

// Real-time data for specific connection
export const selectConnectionRealtimeData = (connectionId) => createSelector(
    [(state) => state.connections?.realtimeData || {}],
    (realtimeData) => realtimeData[connectionId] || null
);

// Paginated connections
export const selectPaginatedConnections = createSelector(
    [selectFilteredConnections, selectPagination],
    (connections, pagination) => {
        const start = (pagination.page - 1) * (pagination.page_size || 20);
        const end = start + (pagination.page_size || 20);
        return connections.slice(start, end);
    }
);

// Check if connections are stale (older than 30 seconds)
export const selectIsStale = createSelector(
    [selectLastUpdated],
    (lastUpdated) => {
        if (!lastUpdated) return true;
        const staleTime = 30 * 1000;
        return Date.now() - new Date(lastUpdated).getTime() > staleTime;
    }
);
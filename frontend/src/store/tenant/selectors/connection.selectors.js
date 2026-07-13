import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  connections: [],
  currentConnection: null,
  tenantConnections: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  metrics: null,
  healthStatus: null,
  actionResult: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { organization_id: null, status: null },
};

export const selectConnectionState = (state) => {
    return state?.connection || state?.tenant?.connection || initialState;
};

export const selectConnections = createSelector(
  [selectConnectionState],
  (state) => state.connections || []
);

export const selectCurrentConnection = createSelector(
  [selectConnectionState],
  (state) => state.currentConnection || null
);

export const selectConnectionLoading = createSelector(
  [selectConnectionState],
  (state) => state.loading || false
);

export const selectConnectionDetailsLoading = createSelector(
  [selectConnectionState],
  (state) => state.loadingDetails || false
);

export const selectConnectionSubmitting = createSelector(
  [selectConnectionState],
  (state) => state.submitting || false
);

export const selectConnectionError = createSelector(
  [selectConnectionState],
  (state) => state.error || null
);

export const selectConnectionPagination = createSelector(
  [selectConnectionState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectConnectionPage = createSelector(
  [selectConnectionState],
  (state) => state.pagination?.page || 1
);

export const selectConnectionTotal = createSelector(
  [selectConnectionState],
  (state) => state.pagination?.total || 0
);

export const selectConnectionTotalPages = createSelector(
  [selectConnectionPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectConnectionFilters = createSelector(
  [selectConnectionState],
  (state) => state.filters || { organization_id: null, status: null }
);

export const selectConnectionMetrics = createSelector(
  [selectConnectionState],
  (state) => state.metrics || null
);

export const selectHealthStatus = createSelector(
  [selectConnectionState],
  (state) => state.healthStatus || null
);

export const selectActionResult = createSelector(
  [selectConnectionState],
  (state) => state.actionResult || null
);

export const selectTenantConnections = createSelector(
  [selectConnectionState, (state, tenantId) => tenantId],
  (state, tenantId) => state.tenantConnections?.[tenantId] || []
);

export const selectConnectionById = createSelector(
  [selectConnections, (state, id) => id],
  (connections, id) => connections.find(c => c.id === id) || null
);

export const selectActiveConnections = createSelector(
  [selectConnections],
  (connections) => connections.filter(c => c.status === 'ACTIVE')
);

export const selectIdleConnections = createSelector(
  [selectConnections],
  (connections) => connections.filter(c => c.status === 'IDLE')
);

export const selectErrorConnections = createSelector(
  [selectConnections],
  (connections) => connections.filter(c => c.status === 'ERROR')
);

export const selectClosedConnections = createSelector(
  [selectConnections],
  (connections) => connections.filter(c => c.status === 'CLOSED')
);

export const selectConnectionsByOrganization = createSelector(
  [selectConnections, (state, orgId) => orgId],
  (connections, orgId) => connections.filter(c => c.organization_id === orgId)
);

export const selectConnectionCount = createSelector(
  [selectConnections],
  (connections) => connections.length
);

export const selectActiveConnectionCount = createSelector(
  [selectActiveConnections],
  (active) => active.length
);

export const selectIdleConnectionCount = createSelector(
  [selectIdleConnections],
  (idle) => idle.length
);

export const selectErrorConnectionCount = createSelector(
  [selectErrorConnections],
  (error) => error.length
);

export const selectHasConnections = createSelector(
  [selectConnections],
  (connections) => connections.length > 0
);

export const selectHasTenantConnections = createSelector(
  [selectTenantConnections],
  (connections) => connections.length > 0
);

export const selectConnectionMetricsSummary = createSelector(
  [selectConnectionMetrics],
  (metrics) => {
    if (!metrics) return null;
    return {
      total: metrics.total_connections || 0,
      active: metrics.active_connections || 0,
      idle: metrics.idle_connections || 0,
      error: metrics.error_connections || 0,
      closed: metrics.closed_connections || 0,
    };
  }
);

export const selectConnectionHealth = createSelector(
  [selectHealthStatus],
  (health) => {
    if (!health) return null;
    return {
      isHealthy: health.is_healthy || false,
      responseTime: health.response_time_ms || 0,
      error: health.error_message || null,
    };
  }
);

export const selectDebugTraces = createSelector(
  [selectConnectionState],
  (state) => state.debugTraces || null
);

export const selectDebugLoading = createSelector(
  [selectConnectionState],
  (state) => state.debugLoading || false
);
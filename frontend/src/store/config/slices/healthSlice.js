import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  checks: [],
  latestChecks: {},
  history: [],
  systemMetrics: {
    cpuPercent: 0,
    memoryPercent: 0,
    diskUsage: 0,
    activeConnections: 0,
    databaseSizeGB: 0
  },
  stats: {
    healthyApps: 0,
    degradedApps: 0,
    unhealthyApps: 0,
    unknownApps: 0
  },
  filters: {
    appName: null,
    status: null,
    dateFrom: null,
    dateTo: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    setHealthChecks: (state, action) => { state.checks = action.payload; },
    setLatestHealthChecks: (state, action) => {
      state.latestChecks = { ...state.latestChecks, ...action.payload };
      const statusCounts = { healthy: 0, degraded: 0, unhealthy: 0, unknown: 0 };
      Object.values(state.latestChecks).forEach(check => {
        if (check.status === 'healthy') statusCounts.healthy++;
        else if (check.status === 'degraded') statusCounts.degraded++;
        else if (check.status === 'unhealthy') statusCounts.unhealthy++;
        else statusCounts.unknown++;
      });
      state.stats = { ...state.stats, ...statusCounts };
    },
    setHealthHistory: (state, action) => { state.history = action.payload; },
    setSystemMetrics: (state, action) => { state.systemMetrics = { ...state.systemMetrics, ...action.payload }; },
    setHealthFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setHealthPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setHealthLoading: (state, action) => { state.loading = action.payload; },
    setHealthError: (state, action) => { state.error = action.payload; },
    addHealthCheck: (state, action) => { state.checks.unshift(action.payload); state.latestChecks[action.payload.app_name] = action.payload; },
    resetHealth: () => initialState
  }
});

export const {
  setHealthChecks, setLatestHealthChecks, setHealthHistory, setSystemMetrics, setHealthFilters,
  setHealthPagination, setHealthLoading, setHealthError, addHealthCheck, resetHealth
} = healthSlice.actions;
export default healthSlice.reducer;
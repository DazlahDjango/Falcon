import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  currentLog: null,
  stats: {
    totalLogs: 0,
    successfulActions: 0,
    failedActions: 0,
    actionsByType: {}
  },
  filters: {
    action: null,
    performedByRole: null,
    result: null,
    targetAppName: null,
    dateFrom: null,
    dateTo: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setAuditLogs: (state, action) => { state.logs = action.payload; },
    setCurrentAuditLog: (state, action) => { state.currentLog = action.payload; },
    setAuditStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setAuditFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setAuditPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setAuditLoading: (state, action) => { state.loading = action.payload; },
    setAuditError: (state, action) => { state.error = action.payload; },
    addAuditLog: (state, action) => { state.logs.unshift(action.payload); },
    resetAudit: () => initialState
  }
});

export const {
  setAuditLogs, setCurrentAuditLog, setAuditStats, setAuditFilters, setAuditPagination,
  setAuditLoading, setAuditError, addAuditLog, resetAudit
} = auditSlice.actions;
export default auditSlice.reducer;
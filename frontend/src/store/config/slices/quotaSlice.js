import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quotas: [],
  currentQuota: null,
  overThresholdQuotas: [],
  exceededQuotas: [],
  stats: {
    totalQuotaGB: 0,
    usedQuotaGB: 0,
    usagePercent: 0,
    totalTenants: 0,
    tenantsOverThreshold: 0
  },
  filters: {
    tenantName: null,
    appName: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null
};

const quotaSlice = createSlice({
  name: 'quota',
  initialState,
  reducers: {
    setQuotas: (state, action) => { state.quotas = action.payload; },
    setCurrentQuota: (state, action) => { state.currentQuota = action.payload; },
    setOverThresholdQuotas: (state, action) => { state.overThresholdQuotas = action.payload; },
    setExceededQuotas: (state, action) => { state.exceededQuotas = action.payload; },
    setQuotaStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setQuotaFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setQuotaPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setQuotaLoading: (state, action) => { state.loading = action.payload; },
    setQuotaError: (state, action) => { state.error = action.payload; },
    updateQuotaInList: (state, action) => {
      const index = state.quotas.findIndex(q => q.id === action.payload.id);
      if (index !== -1) state.quotas[index] = { ...state.quotas[index], ...action.payload };
      if (state.currentQuota?.id === action.payload.id) state.currentQuota = { ...state.currentQuota, ...action.payload };
    },
    resetQuota: () => initialState
  }
});

export const {
  setQuotas, setCurrentQuota, setOverThresholdQuotas, setExceededQuotas, setQuotaStats,
  setQuotaFilters, setQuotaPagination, setQuotaLoading, setQuotaError, updateQuotaInList, resetQuota
} = quotaSlice.actions;
export default quotaSlice.reducer;
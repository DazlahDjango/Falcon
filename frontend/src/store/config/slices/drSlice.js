import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [],
  currentPlan: null,
  executions: [],
  currentExecution: null,
  metrics: {
    rtoAchievementRate: 0,
    rpoAchievementRate: 0,
    drillSuccessRate: 0,
    totalDisastersRecovered: 0
  },
  stats: {
    activePlans: 0,
    totalDrills: 0,
    successfulDrills: 0,
    lastDrillAt: null
  },
  filters: {
    appName: null,
    status: null,
    executionType: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
  wsConnected: false,
  activeDRProgress: null
};

const drSlice = createSlice({
  name: 'disasterRecovery',
  initialState,
  reducers: {
    setDRPlans: (state, action) => { state.plans = action.payload; },
    setCurrentDRPlan: (state, action) => { state.currentPlan = action.payload; },
    setDRExecutions: (state, action) => { state.executions = action.payload; },
    setCurrentDRExecution: (state, action) => { state.currentExecution = action.payload; },
    setDRMetrics: (state, action) => { state.metrics = { ...state.metrics, ...action.payload }; },
    setDRStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setDRFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setDRPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setDRLoading: (state, action) => { state.loading = action.payload; },
    setDRError: (state, action) => { state.error = action.payload; },
    setDRWSConnected: (state, action) => { state.wsConnected = action.payload; },
    setActiveDRProgress: (state, action) => { state.activeDRProgress = action.payload; },
    addDRPlan: (state, action) => { state.plans.unshift(action.payload); },
    updateDRPlan: (state, action) => {
      const index = state.plans.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.plans[index] = { ...state.plans[index], ...action.payload };
      if (state.currentPlan?.id === action.payload.id) state.currentPlan = { ...state.currentPlan, ...action.payload };
    },
    removeDRPlan: (state, action) => { state.plans = state.plans.filter(p => p.id !== action.payload); },
    addDRExecution: (state, action) => { state.executions.unshift(action.payload); },
    updateDRExecution: (state, action) => {
      const index = state.executions.findIndex(e => e.id === action.payload.id);
      if (index !== -1) state.executions[index] = { ...state.executions[index], ...action.payload };
      if (state.currentExecution?.id === action.payload.id) state.currentExecution = { ...state.currentExecution, ...action.payload };
    },
    resetDR: () => initialState
  }
});

export const {
  setDRPlans, setCurrentDRPlan, setDRExecutions, setCurrentDRExecution, setDRMetrics, setDRStats,
  setDRFilters, setDRPagination, setDRLoading, setDRError, setDRWSConnected, setActiveDRProgress,
  addDRPlan, updateDRPlan, removeDRPlan, addDRExecution, updateDRExecution, resetDR
} = drSlice.actions;
export default drSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  windows: [],
  currentWindow: null,
  logs: [],
  activeWindows: [],
  upcomingWindows: [],
  stats: {
    totalMaintenances: 0,
    completedMaintenances: 0,
    cancelledMaintenances: 0,
    failedMaintenances: 0,
    totalDowntimeMinutes: 0
  },
  filters: {
    maintenanceType: null,
    status: null,
    dateFrom: null,
    dateTo: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
  wsConnected: false,
  globalMaintenanceActive: false,
  globalMaintenanceType: null,
  globalMaintenanceMessage: null
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setMaintenanceWindows: (state, action) => { state.windows = action.payload; },
    setCurrentMaintenanceWindow: (state, action) => { state.currentWindow = action.payload; },
    setMaintenanceLogs: (state, action) => { state.logs = action.payload; },
    setActiveWindows: (state, action) => { state.activeWindows = action.payload; },
    setUpcomingWindows: (state, action) => { state.upcomingWindows = action.payload; },
    setMaintenanceStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setMaintenanceFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setMaintenancePagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setMaintenanceLoading: (state, action) => { state.loading = action.payload; },
    setMaintenanceError: (state, action) => { state.error = action.payload; },
    setMaintenanceWSConnected: (state, action) => { state.wsConnected = action.payload; },
    setGlobalMaintenanceStatus: (state, action) => {
      state.globalMaintenanceActive = action.payload.active;
      state.globalMaintenanceType = action.payload.maintenanceType;
      state.globalMaintenanceMessage = action.payload.message;
    },
    addMaintenanceWindow: (state, action) => { state.windows.unshift(action.payload); },
    updateMaintenanceWindow: (state, action) => {
      const index = state.windows.findIndex(w => w.id === action.payload.id);
      if (index !== -1) state.windows[index] = { ...state.windows[index], ...action.payload };
      if (state.currentWindow?.id === action.payload.id) state.currentWindow = { ...state.currentWindow, ...action.payload };
      if (action.payload.status === 'in_progress') {
        if (!state.activeWindows.find(w => w.id === action.payload.id)) state.activeWindows.push(action.payload);
      } else {
        state.activeWindows = state.activeWindows.filter(w => w.id !== action.payload.id);
      }
    },
    removeMaintenanceWindow: (state, action) => { state.windows = state.windows.filter(w => w.id !== action.payload); },
    resetMaintenance: () => initialState
  }
});

export const {
  setMaintenanceWindows, setCurrentMaintenanceWindow, setMaintenanceLogs, setActiveWindows,
  setUpcomingWindows, setMaintenanceStats, setMaintenanceFilters, setMaintenancePagination,
  setMaintenanceLoading, setMaintenanceError, setMaintenanceWSConnected, setGlobalMaintenanceStatus,
  addMaintenanceWindow, updateMaintenanceWindow, removeMaintenanceWindow, resetMaintenance
} = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
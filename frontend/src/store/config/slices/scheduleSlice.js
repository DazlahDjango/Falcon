import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schedules: [],
  currentSchedule: null,
  stats: {
    activeSchedules: 0,
    pausedSchedules: 0,
    expiredSchedules: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0
  },
  filters: {
    scheduleType: null,
    status: null,
    isDisasterOverride: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSchedules: (state, action) => { state.schedules = action.payload; },
    setCurrentSchedule: (state, action) => { state.currentSchedule = action.payload; },
    setScheduleStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setScheduleFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setSchedulePagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setScheduleLoading: (state, action) => { state.loading = action.payload; },
    setScheduleError: (state, action) => { state.error = action.payload; },
    addSchedule: (state, action) => { state.schedules.unshift(action.payload); },
    updateSchedule: (state, action) => {
      const index = state.schedules.findIndex(s => s.id === action.payload.id);
      if (index !== -1) state.schedules[index] = { ...state.schedules[index], ...action.payload };
      if (state.currentSchedule?.id === action.payload.id) state.currentSchedule = { ...state.currentSchedule, ...action.payload };
    },
    removeSchedule: (state, action) => { state.schedules = state.schedules.filter(s => s.id !== action.payload); },
    resetSchedule: () => initialState
  }
});

export const {
  setSchedules, setCurrentSchedule, setScheduleStats, setScheduleFilters, setSchedulePagination,
  setScheduleLoading, setScheduleError, addSchedule, updateSchedule, removeSchedule, resetSchedule
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
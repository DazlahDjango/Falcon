import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobs: [],
  currentJob: null,
  policies: [],
  artifacts: [],
  stats: {
    totalBackups: 0,
    successfulBackups: 0,
    failedBackups: 0,
    totalStorageBytes: 0,
    lastBackupAt: null
  },
  filters: {
    appName: null,
    backupType: null,
    status: null,
    dateFrom: null,
    dateTo: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
  wsConnected: false,
  activeBackupProgress: null
};

const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {
    setBackupJobs: (state, action) => { state.jobs = action.payload; },
    setCurrentBackupJob: (state, action) => { state.currentJob = action.payload; },
    setBackupPolicies: (state, action) => { state.policies = action.payload; },
    setBackupArtifacts: (state, action) => { state.artifacts = action.payload; },
    setBackupStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setBackupFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setBackupPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setBackupLoading: (state, action) => { state.loading = action.payload; },
    setBackupError: (state, action) => { state.error = action.payload; },
    setBackupWSConnected: (state, action) => { state.wsConnected = action.payload; },
    setActiveBackupProgress: (state, action) => { state.activeBackupProgress = action.payload; },
    addBackupJob: (state, action) => { state.jobs.unshift(action.payload); },
    updateBackupJob: (state, action) => {
      const index = state.jobs.findIndex(job => job.id === action.payload.id);
      if (index !== -1) state.jobs[index] = { ...state.jobs[index], ...action.payload };
      if (state.currentJob?.id === action.payload.id) state.currentJob = { ...state.currentJob, ...action.payload };
    },
    removeBackupJob: (state, action) => { state.jobs = state.jobs.filter(job => job.id !== action.payload); },
    resetBackup: () => initialState
  }
});

export const {
  setBackupJobs, setCurrentBackupJob, setBackupPolicies, setBackupArtifacts, setBackupStats,
  setBackupFilters, setBackupPagination, setBackupLoading, setBackupError, setBackupWSConnected,
  setActiveBackupProgress, addBackupJob, updateBackupJob, removeBackupJob, resetBackup
} = backupSlice.actions;
export default backupSlice.reducer;
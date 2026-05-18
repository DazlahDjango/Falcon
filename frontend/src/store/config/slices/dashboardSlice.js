import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overview: {
    apps: { total: 0, critical: 0, healthy: 0, unhealthy: 0 },
    maintenance: { active: 0, scheduled: 0 },
    backups: { pending: 0, running: 0, failedToday: 0, totalStorageGB: 0 },
    disasterRecovery: { activePlans: 0, successfulDrills: 0, highRiskApps: 0 },
    schedules: { active: 0 },
    quota: { usagePercent: 0 }
  },
  backupDashboard: { stats: {}, backupByApp: [], artifactStatus: {} },
  maintenanceDashboard: { upcoming: [], active: [], recent: [], totalDowntimeHours: 0 },
  healthDashboard: { currentHealth: {}, summary: {}, errorRate: {} },
  drDashboard: { plans: [], recentExecutions: [], metrics: {}, highRiskApps: [] },
  schedulingDashboard: { upcomingExecutions: [], recentExecutions: [], failedSchedules: [], stats: {} },
  securityDashboard: { encryption: {}, audit: {}, roleAccess: {} },
  recentActivity: { recentBackups: [], recentMaintenance: [], recentDR: [], recentAudit: [] },
  systemStatus: { maintenance: {}, celery: {}, storage: {} },
  loading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'configDashboard',
  initialState,
  reducers: {
    setOverview: (state, action) => { state.overview = { ...state.overview, ...action.payload }; },
    setBackupDashboard: (state, action) => { state.backupDashboard = { ...state.backupDashboard, ...action.payload }; },
    setMaintenanceDashboard: (state, action) => { state.maintenanceDashboard = { ...state.maintenanceDashboard, ...action.payload }; },
    setHealthDashboard: (state, action) => { state.healthDashboard = { ...state.healthDashboard, ...action.payload }; },
    setDRDashboard: (state, action) => { state.drDashboard = { ...state.drDashboard, ...action.payload }; },
    setSchedulingDashboard: (state, action) => { state.schedulingDashboard = { ...state.schedulingDashboard, ...action.payload }; },
    setSecurityDashboard: (state, action) => { state.securityDashboard = { ...state.securityDashboard, ...action.payload }; },
    setRecentActivity: (state, action) => { state.recentActivity = { ...state.recentActivity, ...action.payload }; },
    setSystemStatus: (state, action) => { state.systemStatus = { ...state.systemStatus, ...action.payload }; },
    setConfigDashboardLoading: (state, action) => { state.loading = action.payload; },
    setConfigDashboardError: (state, action) => { state.error = action.payload; },
    setLastUpdated: (state, action) => { state.lastUpdated = action.payload; },
    resetConfigDashboard: () => initialState
  }
});

export const {
  setOverview, setBackupDashboard, setMaintenanceDashboard, setHealthDashboard, setDRDashboard,
  setSchedulingDashboard, setSecurityDashboard, setRecentActivity, setSystemStatus,
  setConfigDashboardLoading, setConfigDashboardError, setLastUpdated, resetConfigDashboard
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
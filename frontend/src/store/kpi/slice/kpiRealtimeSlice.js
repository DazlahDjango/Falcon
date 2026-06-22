import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wsConnected: { 
        dashboard: false, 
        validation: false, 
        notifications: false,
        team: false,
        executive: false,
        scores: false,
        analytics: false,
        alerts: false
    },
    banner: null,
    pendingValidationCount: 0,
    latestScore: null,
    latestValidation: null,
    validationRefreshToken: 0,
    lastRedAlert: null,
    teamUpdates: null,
    executiveMetrics: null,
    analyticsData: null,
    alerts: []
};

const kpiRealtimeSlice = createSlice({
    name: 'kpiRealtime',
    initialState,
    reducers: {
        setKpiWsConnected(state, action) {
            state.wsConnected = { ...state.wsConnected, ...action.payload };
        },
        setKpiBanner(state, action) {
            state.banner = action.payload;
        },
        clearKpiBanner(state) {
            state.banner = null;
        },
        setPendingValidationCount(state, action) {
            state.pendingValidationCount = action.payload;
        },
        setLatestScore(state, action) {
            state.latestScore = action.payload;
        },
        setLatestValidation(state, action) {
            state.latestValidation = action.payload;
            state.validationRefreshToken += 1;
        },
        setLastRedAlert(state, action) {
            state.lastRedAlert = action.payload;
        },
        bumpValidationRefresh(state) {
            state.validationRefreshToken += 1;
        },
        setTeamUpdates(state, action) {
            state.teamUpdates = action.payload;
        },
        setExecutiveMetrics(state, action) {
            state.executiveMetrics = action.payload;
        },
        setAnalyticsData(state, action) {
            state.analyticsData = action.payload;
        },
        addAlert(state, action) {
            state.alerts = [action.payload, ...state.alerts].slice(0, 50);
        },
        clearAlerts(state) {
            state.alerts = [];
        }
    },
});

export const {
    setKpiWsConnected,
    setKpiBanner,
    clearKpiBanner,
    setPendingValidationCount,
    setLatestScore,
    setLatestValidation,
    setLastRedAlert,
    bumpValidationRefresh,
    setTeamUpdates,
    setExecutiveMetrics,
    setAnalyticsData,
    addAlert,
    clearAlerts,
} = kpiRealtimeSlice.actions;

export default kpiRealtimeSlice.reducer;
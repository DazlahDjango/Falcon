import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wsConnected: { dashboard: false, validation: false, notifications: false },
    banner: null,
    pendingValidationCount: 0,
    latestScore: null,
    latestValidation: null,
    validationRefreshToken: 0,
    lastRedAlert: null,
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
} = kpiRealtimeSlice.actions;

export default kpiRealtimeSlice.reducer;

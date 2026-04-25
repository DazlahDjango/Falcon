import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    individual: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    manager: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    executive: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    champion: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    period: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    },
};
const kpiDashboardsSlice = createSlice({
    name: 'kpiDashboard',
    initialState,
    reducers: {
        // Individual dashboard
        fetchIndividualStart: (state) => {
            state.individual.loading = true;
            state.individual.error = null;
        },
        fetchIndividualSuccess: (state, action) => {
            state.individual.loading = false;
            state.individual.data = action.payload;
            state.individual.lastUpdated = new Date().toISOString();
        },
        fetchIndividualFailure: (state, action) => {
            state.individual.loading = false;
            state.individual.error = action.payload;
        },
        // Manager dashboard
        fetchManagerStart: (state) => {
            state.manager.loading = true;
            state.manager.error = null;
        },
        fetchManagerSuccess: (state, action) => {
            state.manager.loading = false;
            state.manager.data = action.payload;
            state.manager.lastUpdated = new Date().toISOString();
        },
        fetchManagerFailure: (state, action) => {
            state.manager.loading = false;
            state.manager.error = action.payload;
        },
        // Executive dashboard
        fetchExecutiveStart: (state) => {
            state.executive.loading = true;
            state.executive.error = null;
        },
        fetchExecutiveSuccess: (state, action) => {
            state.executive.loading = false;
            state.executive.data = action.payload;
            state.executive.lastUpdated = new Date().toISOString();
        },
        fetchExecutiveFailure: (state, action) => {
            state.executive.loading = false;
            state.executive.error = action.payload;
        },
        // Champion dashboard
        fetchChampionStart: (state) => {
            state.champion.loading = true;
            state.champion.error = null;
        },
        fetchChampionSuccess: (state, action) => {
            state.champion.loading = false;
            state.champion.data = action.payload;
            state.champion.lastUpdated = new Date().toISOString();
        },
        fetchChampionFailure: (state, action) => {
            state.champion.loading = false;
            state.champion.error = action.payload;
        },
        // Period
        fetchDashboardPeriod: (state, action) => {
            state.period = { ...state.period, ...action.payload };
        },
        // Refresh
        refreshDashboard: (state, action) => {
            const dashboardType = action.payload;
            if (dashboardType === 'individual') {
                state.individual.lastUpdated = null;
            } else if (dashboardType === 'manager') {
                state.manager.lastUpdated = null;
            } else if (dashboardType === 'executive') {
                state.executive.lastUpdated = null;
            } else if (dashboardType === 'champion') {
                state.champion.lastUpdated = null;
            }
        },
        refreshAllDashboards: (state) => {
            state.individual.lastUpdated = null;
            state.manager.lastUpdated = null;
            state.executive.lastUpdated = null;
            state.champion.lastUpdated = null;
        },
        // Clear
        clearIndividualDashboard: (state) => {
            state.individual.data = null;
        },
        clearManagerDashboard: (state) => {
            state.manager.data = null;
        },
        clearExecutiveDashboard: (state) => {
            state.executive.data = null;
        },
        clearChampionDashboard: (state) => {
            state.champion.data = null;
        },
    },
});
export const {
    fetchIndividualStart,
    fetchIndividualSuccess,
    fetchIndividualFailure,
    fetchManagerStart,
    fetchManagerSuccess,
    fetchManagerFailure,
    fetchExecutiveStart,
    fetchExecutiveSuccess,
    fetchExecutiveFailure,
    fetchChampionStart,
    fetchChampionSuccess,
    fetchChampionFailure,
    setDashboardPeriod,
    refreshDashboard,
    refreshAllDashboards,
    clearIndividualDashboard,
    clearManagerDashboard,
    clearExecutiveDashboard,
    clearChampionDashboard,
} = kpiDashboardsSlice.actions;
export default kpiDashboardsSlice.reducer;
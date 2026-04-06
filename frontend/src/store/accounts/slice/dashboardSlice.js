import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';
import * as kpiApi from '../../../services/accounts/api/kpi';

// Async Thunks
// =============
export const fetchUserStats = createAsyncThunk(
    'dashboard/fetchUserStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getCurrentUser();
            return response.data.stats;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
        }
    }
);
export const fetchUserKPIs = createAsyncThunk(
    'dashboard/fetchUserKPIs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await kpiApi.getUserKPIs(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch KPIs');
        }
    }
);
export const fetchUserActivities = createAsyncThunk(
    'dashboard/fetchUserActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getUserActivity();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch activities');
        }
    }
);

// Initial State
// ================
const initialState = {
    stats: {
        overall_score: 0,
        score_trend: 0,
        completed_kpis: 0,
        total_kpis: 0,
        pending_tasks: 0,
        overdue_tasks: 0,
        upcoming_reviews: 0,
        next_review_date: null
    },
    kpis: [],
    activities: [],
    isLoading: false,
    error: null
};

// Slice
// ========
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchUserStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            .addCase(fetchUserKPIs.fulfilled, (state, action) => {
                state.kpis = action.payload.results;
            })
            
            .addCase(fetchUserActivities.fulfilled, (state, action) => {
                state.activities = action.payload.results;
            });
    }
});
export const { clearError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../../services/accounts/api/admin';
import * as reportsApi from '../../../services/accounts/api/reports';

// Async Thunks
// ==============
export const fetchOrgStats = createAsyncThunk(
    'executive/fetchOrgStats',
    async ({ range = 'month' }, { rejectWithValue }) => {
        try {
            const response = await reportsApi.getOrganizationStats(range);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch org stats');
        }
    }
);
export const fetchDepartmentPerformance = createAsyncThunk(
    'executive/fetchDepartmentPerformance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reportsApi.getDepartmentPerformance();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch department performance');
        }
    }
);
export const fetchExecutiveKPIs = createAsyncThunk(
    'executive/fetchExecutiveKPIs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reportsApi.getExecutiveKPIs();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch KPIs');
        }
    }
);
export const fetchOrgActivities = createAsyncThunk(
    'executive/fetchOrgActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reportsApi.getOrganizationActivities();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch activities');
        }
    }
);

// Initial State
// ===============
const initialState = {
    stats: {
        org_score: 0,
        score_trend: 0,
        active_employees: 0,
        employee_trend: 0,
        total_departments: 0,
        departments_on_track: 0,
        monthly_scores: [],
        top_performer: null
    },
    departments: [],
    kpis: {
        on_track: 0,
        at_risk: 0,
        off_track: 0
    },
    activities: [],
    isLoading: false,
    error: null
};

// Slice
// ======
const executiveSlice = createSlice({
    name: 'executive',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrgStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOrgStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchOrgStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchDepartmentPerformance.fulfilled, (state, action) => {
                state.departments = action.payload.results;
            })
            .addCase(fetchExecutiveKPIs.fulfilled, (state, action) => {
                state.kpis = action.payload;
            })
            .addCase(fetchOrgActivities.fulfilled, (state, action) => {
                state.activities = action.payload.results;
            });
    }
});
export const { clearError } = executiveSlice.actions;

export default executiveSlice.reducer;
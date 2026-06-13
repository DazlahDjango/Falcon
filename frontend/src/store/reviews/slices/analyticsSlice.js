// src/store/reviews/slices/analyticsSlice.js
// Redux slice for analytics state (company, department, manager analytics)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '@/services/reviews';

// ========== Async Thunks ==========

// Fetch company analytics
export const fetchCompanyAnalytics = createAsyncThunk(
    'reviews/analytics/fetchCompany',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getCompanyAnalytics(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch company analytics');
        }
    }
);

// Fetch company trends
export const fetchCompanyTrends = createAsyncThunk(
    'reviews/analytics/fetchCompanyTrends',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getCompanyTrends(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch company trends');
        }
    }
);

// Fetch departments analytics
export const fetchDepartmentsAnalytics = createAsyncThunk(
    'reviews/analytics/fetchDepartments',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getDepartmentsAnalytics(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch departments analytics');
        }
    }
);

// Fetch specific department analytics
export const fetchDepartmentAnalytics = createAsyncThunk(
    'reviews/analytics/fetchDepartment',
    async ({ departmentId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getDepartmentAnalytics(departmentId, params);
            return { departmentId, data: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch department analytics');
        }
    }
);

// Fetch managers analytics
export const fetchManagersAnalytics = createAsyncThunk(
    'reviews/analytics/fetchManagers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getManagersAnalytics(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch managers analytics');
        }
    }
);

// Fetch specific manager analytics
export const fetchManagerAnalytics = createAsyncThunk(
    'reviews/analytics/fetchManager',
    async ({ managerId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getManagerAnalytics(managerId, params);
            return { managerId, data: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch manager analytics');
        }
    }
);

// Fetch manager team analytics
export const fetchManagerTeam = createAsyncThunk(
    'reviews/analytics/fetchManagerTeam',
    async ({ managerId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await analyticsService.getManagerTeam(managerId, params);
            return { managerId, team: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch manager team');
        }
    }
);

// Refresh all analytics
export const refreshAllAnalytics = createAsyncThunk(
    'reviews/analytics/refreshAll',
    async (params = {}, { rejectWithValue, dispatch }) => {
        try {
            await Promise.all([
                dispatch(fetchCompanyAnalytics(params)).unwrap(),
                dispatch(fetchDepartmentsAnalytics(params)).unwrap(),
                dispatch(fetchManagersAnalytics(params)).unwrap(),
                dispatch(fetchCompanyTrends(params)).unwrap(),
            ]);
            return { refreshed: true, timestamp: new Date().toISOString() };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to refresh analytics');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    // Company analytics
    companyAnalytics: null,
    companyTrends: null,
    companyLoading: false,
    companyError: null,
    
    // Departments analytics
    departments: [],
    departmentsLoading: false,
    departmentsError: null,
    currentDepartment: null,
    departmentData: {},
    
    // Managers analytics
    managers: [],
    managersLoading: false,
    managersError: null,
    currentManager: null,
    managerData: {},
    managerTeamData: {},
    
    // Refresh status
    lastRefreshed: null,
    refreshInProgress: false,
    
    // General
    loading: false,
    error: null,
};

// ========== Slice ==========
const analyticsSlice = createSlice({
    name: 'reviews/analytics',
    initialState,
    reducers: {
        clearAnalyticsErrors: (state) => {
            state.companyError = null;
            state.departmentsError = null;
            state.managersError = null;
            state.error = null;
        },
        setCurrentDepartment: (state, action) => {
            state.currentDepartment = action.payload;
        },
        setCurrentManager: (state, action) => {
            state.currentManager = action.payload;
        },
        clearDepartmentData: (state) => {
            state.departmentData = {};
            state.currentDepartment = null;
        },
        clearManagerData: (state) => {
            state.managerData = {};
            state.managerTeamData = {};
            state.currentManager = null;
        },
        clearAllAnalytics: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== Company Analytics ==========
            .addCase(fetchCompanyAnalytics.pending, (state) => {
                state.companyLoading = true;
                state.companyError = null;
            })
            .addCase(fetchCompanyAnalytics.fulfilled, (state, action) => {
                state.companyLoading = false;
                state.companyAnalytics = action.payload;
            })
            .addCase(fetchCompanyAnalytics.rejected, (state, action) => {
                state.companyLoading = false;
                state.companyError = action.payload;
            })
            
            // ========== Company Trends ==========
            .addCase(fetchCompanyTrends.pending, (state) => {
                state.companyLoading = true;
                state.companyError = null;
            })
            .addCase(fetchCompanyTrends.fulfilled, (state, action) => {
                state.companyLoading = false;
                state.companyTrends = action.payload;
            })
            .addCase(fetchCompanyTrends.rejected, (state, action) => {
                state.companyLoading = false;
                state.companyError = action.payload;
            })
            
            // ========== Departments Analytics ==========
            .addCase(fetchDepartmentsAnalytics.pending, (state) => {
                state.departmentsLoading = true;
                state.departmentsError = null;
            })
            .addCase(fetchDepartmentsAnalytics.fulfilled, (state, action) => {
                state.departmentsLoading = false;
                state.departments = action.payload.results || action.payload;
            })
            .addCase(fetchDepartmentsAnalytics.rejected, (state, action) => {
                state.departmentsLoading = false;
                state.departmentsError = action.payload;
            })
            
            // ========== Single Department ==========
            .addCase(fetchDepartmentAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.departmentData[action.payload.departmentId] = action.payload.data;
            })
            .addCase(fetchDepartmentAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Managers Analytics ==========
            .addCase(fetchManagersAnalytics.pending, (state) => {
                state.managersLoading = true;
                state.managersError = null;
            })
            .addCase(fetchManagersAnalytics.fulfilled, (state, action) => {
                state.managersLoading = false;
                state.managers = action.payload.results || action.payload;
            })
            .addCase(fetchManagersAnalytics.rejected, (state, action) => {
                state.managersLoading = false;
                state.managersError = action.payload;
            })
            
            // ========== Single Manager ==========
            .addCase(fetchManagerAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchManagerAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.managerData[action.payload.managerId] = action.payload.data;
            })
            .addCase(fetchManagerAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Manager Team ==========
            .addCase(fetchManagerTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchManagerTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.managerTeamData[action.payload.managerId] = action.payload.team;
            })
            .addCase(fetchManagerTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Refresh All ==========
            .addCase(refreshAllAnalytics.pending, (state) => {
                state.refreshInProgress = true;
                state.error = null;
            })
            .addCase(refreshAllAnalytics.fulfilled, (state, action) => {
                state.refreshInProgress = false;
                state.lastRefreshed = action.payload.timestamp;
            })
            .addCase(refreshAllAnalytics.rejected, (state, action) => {
                state.refreshInProgress = false;
                state.error = action.payload;
            });
    },
});

// ========== Actions ==========
export const {
    clearAnalyticsErrors,
    setCurrentDepartment,
    setCurrentManager,
    clearDepartmentData,
    clearManagerData,
    clearAllAnalytics,
} = analyticsSlice.actions;

// ========== Selectors ==========
export const selectCompanyAnalytics = (state) => state.reviewsAnalytics.companyAnalytics;
export const selectCompanyTrends = (state) => state.reviewsAnalytics.companyTrends;
export const selectDepartments = (state) => state.reviewsAnalytics.departments;
export const selectManagers = (state) => state.reviewsAnalytics.managers;
export const selectDepartmentData = (state, departmentId) => state.reviewsAnalytics.departmentData[departmentId];
export const selectManagerData = (state, managerId) => state.reviewsAnalytics.managerData[managerId];
export const selectManagerTeam = (state, managerId) => state.reviewsAnalytics.managerTeamData[managerId];
export const selectAnalyticsLoading = (state) => ({
    company: state.reviewsAnalytics.companyLoading,
    departments: state.reviewsAnalytics.departmentsLoading,
    managers: state.reviewsAnalytics.managersLoading,
    general: state.reviewsAnalytics.loading,
});
export const selectAnalyticsErrors = (state) => ({
    company: state.reviewsAnalytics.companyError,
    departments: state.reviewsAnalytics.departmentsError,
    managers: state.reviewsAnalytics.managersError,
    general: state.reviewsAnalytics.error,
});
export const selectLastRefreshed = (state) => state.reviewsAnalytics.lastRefreshed;
export const selectRefreshInProgress = (state) => state.reviewsAnalytics.refreshInProgress;

export default analyticsSlice.reducer;
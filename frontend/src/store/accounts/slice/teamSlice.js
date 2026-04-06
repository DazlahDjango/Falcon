import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';

// Async Thunks
// ==============
export const fetchTeamHierarchy = createAsyncThunk(
    'team/fetchHierarchy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getTeamHierarchy();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team hierarchy');
        }
    }
);
export const fetchTeamStats = createAsyncThunk(
    'team/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getTeamStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team stats');
        }
    }
);
export const fetchTeamMembers = createAsyncThunk(
    'team/fetchMembers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getMyTeam();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team members');
        }
    }
);
export const fetchTeamActivities = createAsyncThunk(
    'team/fetchActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getTeamActivities();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team activities');
        }
    }
);
export const fetchReportingChain = createAsyncThunk(
    'team/fetchReportingChain',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.getReportingChain(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch reporting chain');
        }
    }
);

// Initial State
// ==============
const initialState = {
    hierarchy: null,
    stats: {
        total_members: 0,
        active_members: 0,
        active_percentage: 0,
        avg_score: 0,
        score_trend: 0,
        at_risk_members: 0,
        at_risk_percentage: 0,
        pending_approvals: 0,
        member_trend: 0
    },
    teamMembers: [],
    activities: [],
    reportingChain: [],
    isLoading: false,
    error: null
};

// Slice
// =========
const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeamHierarchy.fulfilled, (state, action) => {
                state.hierarchy = action.payload;
            })
            .addCase(fetchTeamStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action) => {
                state.teamMembers = action.payload.results;
            })
            .addCase(fetchTeamActivities.fulfilled, (state, action) => {
                state.activities = action.payload.results;
            })
            .addCase(fetchReportingChain.fulfilled, (state, action) => {
                state.reportingChain = action.payload;
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state) => {
                    state.isLoading = false;
                }
            );
    }
});
export const { clearError } = teamSlice.actions;

export default teamSlice.reducer;
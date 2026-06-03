// frontend/src/store/accounts/slice/teamSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';

// ============================================================
// Async Thunks
// ============================================================

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

export const fetchTeamMemberById = createAsyncThunk(
    'team/fetchMemberById',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersApi.getTeam(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team member');
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

export const fetchMyReportingChain = createAsyncThunk(
    'team/fetchMyReportingChain',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getMyReportingChain();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch reporting chain');
        }
    }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
    teamMembers: [],
    selectedMember: null,
    reportingChain: [],
    isLoading: false,
    error: null
};

// ============================================================
// Slice
// ============================================================

const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        clearSelectedMember: (state) => {
            state.selectedMember = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetTeam: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Fetch Team Members
            .addCase(fetchTeamMembers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.teamMembers = action.payload.results || action.payload || [];
            })
            .addCase(fetchTeamMembers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Team Member By ID
            .addCase(fetchTeamMemberById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamMemberById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedMember = action.payload;
            })
            .addCase(fetchTeamMemberById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Reporting Chain
            .addCase(fetchReportingChain.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReportingChain.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reportingChain = action.payload.reporting_chain || action.payload || [];
            })
            .addCase(fetchReportingChain.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch My Reporting Chain
            .addCase(fetchMyReportingChain.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyReportingChain.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reportingChain = action.payload.reporting_chain || action.payload || [];
            })
            .addCase(fetchMyReportingChain.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

// ============================================================
// Actions & Selectors
// ============================================================

export const { clearSelectedMember, clearError, resetTeam } = teamSlice.actions;

export const selectTeam = (state) => state.team;
export const selectTeamMembers = (state) => state.team.teamMembers;
export const selectSelectedMember = (state) => state.team.selectedMember;
export const selectReportingChain = (state) => state.team.reportingChain;
export const selectTeamLoading = (state) => state.team.isLoading;
export const selectTeamError = (state) => state.team.error;

export default teamSlice.reducer;
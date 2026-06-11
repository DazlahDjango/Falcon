import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/accounts/api/users';
import * as teamApi from '../../../services/accounts/api/team';

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
// Team Hierarchy & Stats Thunks
// ============================================================

export const fetchTeamHierarchy = createAsyncThunk(
    'team/fetchHierarchy',
    async (_, { rejectWithValue }) => {
        try {
            // Build hierarchy from team members
            const response = await usersApi.getMyTeam();
            const members = response.data.results || response.data || [];
            
            // Build hierarchy tree
            const buildHierarchy = (membersList, managerId = null) => {
                return membersList
                    .filter(m => m.manager_id === managerId)
                    .map(m => ({
                        ...m,
                        name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
                        role_display: m.role?.replace('_', ' ').toUpperCase() || m.role,
                        children: buildHierarchy(membersList, m.id)
                    }));
            };
            
            const root = buildHierarchy(members, null);
            const topManager = root[0] || null;
            
            return {
                root: topManager,
                members: members,
                total_members: members.length
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team hierarchy');
        }
    }
);

export const fetchTeamStats = createAsyncThunk(
    'team/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getMyTeam();
            const members = response.data.results || response.data || [];
            
            // Calculate stats
            const totalMembers = members.length;
            const activeMembers = members.filter(m => m.is_active).length;
            const avgScore = members.reduce((acc, m) => acc + (m.performance_score || 0), 0) / (totalMembers || 1);
            const atRiskMembers = members.filter(m => (m.performance_score || 0) < 60).length;
            
            return {
                total_members: totalMembers,
                active_members: activeMembers,
                active_percentage: totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0,
                avg_score: Math.round(avgScore),
                score_trend: '+5%',
                at_risk_members: atRiskMembers,
                at_risk_percentage: totalMembers ? Math.round((atRiskMembers / totalMembers) * 100) : 0,
                member_trend: '+12%',
                by_role: members.reduce((acc, m) => {
                    acc[m.role] = (acc[m.role] || 0) + 1;
                    return acc;
                }, {})
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch team stats');
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
    hierarchy: null,
    stats: {
        total_members: 0,
        active_members: 0,
        active_percentage: 0,
        avg_score: 0,
        score_trend: 0,
        at_risk_members: 0,
        at_risk_percentage: 0,
        member_trend: 0,
        by_role: {}
    },
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
            })
            // Fetch Team Hierarchy
            .addCase(fetchTeamHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hierarchy = action.payload;
            })
            .addCase(fetchTeamHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Team Stats
            .addCase(fetchTeamStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchTeamStats.rejected, (state, action) => {
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
export const selectTeamHierarchy = (state) => state.team.hierarchy;
export const selectTeamStats = (state) => state.team.stats;
export const selectTeamLoading = (state) => state.team.isLoading;
export const selectTeamError = (state) => state.team.error;

export default teamSlice.reducer;
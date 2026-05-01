import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamApi } from '../../../services/organisations/teamService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all teams
 */
export const fetchTeams = createAsyncThunk(
  'team/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await teamApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

/**
 * Fetch team by ID
 */
export const fetchTeamById = createAsyncThunk(
  'team/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teamApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
    }
  }
);

/**
 * Create team
 */
export const createTeam = createAsyncThunk(
  'team/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teamApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

/**
 * Update team
 */
export const updateTeam = createAsyncThunk(
  'team/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teamApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update team');
    }
  }
);

/**
 * Delete team
 */
export const deleteTeam = createAsyncThunk(
  'team/delete',
  async (id, { rejectWithValue }) => {
    try {
      await teamApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete team');
    }
  }
);

/**
 * Fetch team members
 */
export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teamApi.getMembers(id);
      return { id, members: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team members');
    }
  }
);

/**
 * Add team member
 */
export const addTeamMember = createAsyncThunk(
  'team/addMember',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await teamApi.addMember(id, userId);
      return { teamId: id, member: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

/**
 * Remove team member
 */
export const removeTeamMember = createAsyncThunk(
  'team/removeMember',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await teamApi.removeMember(teamId, userId);
      return { teamId, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

/**
 * Set team lead
 */
export const setTeamLead = createAsyncThunk(
  'team/setLead',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await teamApi.setTeamLead(id, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set team lead');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  teams: [],
  currentTeam: null,
  teamMembers: {},
  loading: false,
  error: null,
  total: 0,
};

// ============================================================
// Slice
// ============================================================

const teamSlice = createSlice({
  name: 'orgTeam',
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
    clearTeamError: (state) => {
      state.error = null;
    },
    clearTeamMembers: (state, action) => {
      if (action.payload) {
        delete state.teamMembers[action.payload];
      } else {
        state.teamMembers = {};
      }
    },
    clearTeams: (state) => {
      state.teams = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchTeams
      // ============================================================
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchTeamById
      // ============================================================
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.currentTeam = action.payload;
      })
      
      // ============================================================
      // createTeam
      // ============================================================
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      
      // ============================================================
      // updateTeam
      // ============================================================
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      
      // ============================================================
      // deleteTeam
      // ============================================================
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t.id !== action.payload);
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      
      // ============================================================
      // fetchTeamMembers
      // ============================================================
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers[action.payload.id] = action.payload.members;
      })
      
      // ============================================================
      // addTeamMember
      // ============================================================
      .addCase(addTeamMember.fulfilled, (state, action) => {
        const { teamId, member } = action.payload;
        if (state.teamMembers[teamId]) {
          state.teamMembers[teamId].push(member);
        }
      })
      
      // ============================================================
      // removeTeamMember
      // ============================================================
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        const { teamId, userId } = action.payload;
        if (state.teamMembers[teamId]) {
          state.teamMembers[teamId] = state.teamMembers[teamId].filter(m => m.id !== userId);
        }
      })
      
      // ============================================================
      // setTeamLead
      // ============================================================
      .addCase(setTeamLead.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearCurrentTeam, clearTeamError, clearTeamMembers, clearTeams } = teamSlice.actions;
export default teamSlice.reducer;
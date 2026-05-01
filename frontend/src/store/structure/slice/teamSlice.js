import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamService } from '../../../services/structure/team.service';
import { initialTeamState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchTeams = createAsyncThunk(
  'structure/teams/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await teamService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'structure/teams/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teamService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team');
    }
  }
);

export const fetchTeamHierarchy = createAsyncThunk(
  'structure/teams/fetchHierarchy',
  async ({ departmentId, includeInactive = false }, { rejectWithValue }) => {
    try {
      const response = await teamService.getHierarchy(departmentId, { include_inactive: includeInactive });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team hierarchy');
    }
  }
);

export const createTeam = createAsyncThunk(
  'structure/teams/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.create(data);
      dispatch(showToast({ message: 'Team created successfully', type: 'success' }));
      dispatch(fetchTeams({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to create team', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateTeam = createAsyncThunk(
  'structure/teams/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.update(id, data);
      dispatch(showToast({ message: 'Team updated successfully', type: 'success' }));
      dispatch(fetchTeamById(id));
      dispatch(fetchTeams({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update team', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'structure/teams/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await teamService.delete(id);
      dispatch(showToast({ message: 'Team deleted successfully', type: 'success' }));
      dispatch(fetchTeams({}));
      return id;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to delete team', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'structure/teams/addMember',
  async ({ id, userId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.addMember(id, userId);
      dispatch(showToast({ message: 'Member added successfully', type: 'success' }));
      dispatch(fetchTeamById(id));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to add member', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'structure/teams/removeMember',
  async ({ id, userId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.removeMember(id, userId);
      dispatch(showToast({ message: 'Member removed successfully', type: 'success' }));
      dispatch(fetchTeamById(id));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to remove member', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

const teamSlice = createSlice({
  name: 'structure/teams',
  initialState: initialTeamState,
  reducers: {
    setTeamPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setTeamFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearTeamFilters: (state) => {
      state.filters = initialTeamState.filters;
      state.pagination.page = 1;
    },
    setTeamPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamHierarchy.fulfilled, (state, action) => {
        state.hierarchy = action.payload;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});
export const { setTeamPageSize, setTeamFilters, clearTeamFilters, setTeamPage, clearSelectedTeam } = teamSlice.actions;
export default teamSlice.reducer;
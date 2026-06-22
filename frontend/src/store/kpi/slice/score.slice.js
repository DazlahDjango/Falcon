/**
 * Score Slice - Scores, Aggregated Scores, Traffic Lights
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scoreService } from '../../../services/kpi';

// ============ Async Thunks ============

export const fetchScores = createAsyncThunk(
  'score/fetchScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyScores = createAsyncThunk(
  'score/fetchMyScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getMyScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTeamScores = createAsyncThunk(
  'score/fetchTeamScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getTeamScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchScoreStatistics = createAsyncThunk(
  'score/fetchScoreStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getScoreStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAggregatedScores = createAsyncThunk(
  'score/fetchAggregatedScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getAggregatedScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrganizationScores = createAsyncThunk(
  'score/fetchOrganizationScores',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getOrganizationScores(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartmentRanking = createAsyncThunk(
  'score/fetchDepartmentRanking',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getDepartmentRanking(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRedAlerts = createAsyncThunk(
  'score/fetchRedAlerts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getRedAlerts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyRedAlerts = createAsyncThunk(
  'score/fetchMyRedAlerts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await scoreService.getMyRedAlerts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  scores: [],
  myScores: [],
  teamScores: [],
  scoreStatistics: null,
  aggregatedScores: [],
  organizationScores: null,
  departmentRanking: [],
  redAlerts: [],
  myRedAlerts: [],
  
  loading: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    clearScores: (state) => {
      state.scores = [];
      state.myScores = [];
      state.teamScores = [];
      state.scoreStatistics = null;
    },
    clearRedAlerts: (state) => {
      state.redAlerts = [];
      state.myRedAlerts = [];
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload.results || action.payload;
        if (action.payload.count) state.pagination.total = action.payload.count;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchMyScores.fulfilled, (state, action) => {
        state.myScores = action.payload.results || action.payload;
      })
      
      .addCase(fetchTeamScores.fulfilled, (state, action) => {
        state.teamScores = action.payload.results || action.payload;
      })
      
      .addCase(fetchScoreStatistics.fulfilled, (state, action) => {
        state.scoreStatistics = action.payload;
      })
      
      .addCase(fetchAggregatedScores.fulfilled, (state, action) => {
        state.aggregatedScores = action.payload.results || action.payload;
      })
      
      .addCase(fetchOrganizationScores.fulfilled, (state, action) => {
        state.organizationScores = action.payload;
      })
      
      .addCase(fetchDepartmentRanking.fulfilled, (state, action) => {
        state.departmentRanking = action.payload.results || action.payload;
      })
      
      .addCase(fetchRedAlerts.fulfilled, (state, action) => {
        state.redAlerts = action.payload.results || action.payload;
      })
      
      .addCase(fetchMyRedAlerts.fulfilled, (state, action) => {
        state.myRedAlerts = action.payload.results || action.payload;
      });
  },
});

export const { clearScores, clearRedAlerts, clearErrors } = scoreSlice.actions;
export default scoreSlice.reducer;
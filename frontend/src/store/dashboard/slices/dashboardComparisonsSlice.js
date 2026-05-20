import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { comparisonService } from '../../../services/dashboard/comparison.service';

const initialState = {
  comparisons: [],
  selectedComparison: null,
  comparisonResults: null,
  loading: false,
  calculating: false,
  error: null,
  lastFetched: null
};

export const fetchComparisons = createAsyncThunk(
  'dashboardComparisons/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await comparisonService.getComparisons(filters);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch comparisons');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch comparisons');
    }
  }
);

export const createComparison = createAsyncThunk(
  'dashboardComparisons/create',
  async (comparisonData, { rejectWithValue }) => {
    try {
      const response = await comparisonService.createComparison(comparisonData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create comparison');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create comparison');
    }
  }
);

export const updateComparison = createAsyncThunk(
  'dashboardComparisons/update',
  async ({ comparisonId, comparisonData }, { rejectWithValue }) => {
    try {
      const response = await comparisonService.updateComparison(comparisonId, comparisonData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update comparison');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update comparison');
    }
  }
);

export const deleteComparison = createAsyncThunk(
  'dashboardComparisons/delete',
  async (comparisonId, { rejectWithValue }) => {
    try {
      const response = await comparisonService.deleteComparison(comparisonId);
      if (response?.success) {
        return comparisonId;
      }
      return rejectWithValue(response?.message || 'Failed to delete comparison');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete comparison');
    }
  }
);

export const calculateComparison = createAsyncThunk(
  'dashboardComparisons/calculate',
  async (comparisonId, { rejectWithValue }) => {
    try {
      const response = await comparisonService.calculateComparison(comparisonId);
      if (response?.success) {
        return { comparisonId, results: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to calculate comparison');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to calculate comparison');
    }
  }
);

const dashboardComparisonsSlice = createSlice({
  name: 'dashboardComparisons',
  initialState,
  reducers: {
    setSelectedComparison: (state, action) => {
      state.selectedComparison = action.payload;
      state.comparisonResults = action.payload?.cached_results || null;
    },
    clearSelectedComparison: (state) => {
      state.selectedComparison = null;
      state.comparisonResults = null;
    },
    clearComparisonsError: (state) => {
      state.error = null;
    },
    resetComparisonsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComparisons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComparisons.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisons = action.payload.results || action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchComparisons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createComparison.fulfilled, (state, action) => {
        state.comparisons.unshift(action.payload);
      })
      .addCase(updateComparison.fulfilled, (state, action) => {
        const index = state.comparisons.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comparisons[index] = action.payload;
        }
        if (state.selectedComparison?.id === action.payload.id) {
          state.selectedComparison = action.payload;
        }
      })
      .addCase(deleteComparison.fulfilled, (state, action) => {
        state.comparisons = state.comparisons.filter(c => c.id !== action.payload);
        if (state.selectedComparison?.id === action.payload) {
          state.selectedComparison = null;
          state.comparisonResults = null;
        }
      })
      .addCase(calculateComparison.pending, (state) => {
        state.calculating = true;
      })
      .addCase(calculateComparison.fulfilled, (state, action) => {
        state.calculating = false;
        state.comparisonResults = action.payload.results;
        const index = state.comparisons.findIndex(c => c.id === action.payload.comparisonId);
        if (index !== -1) {
          state.comparisons[index].cached_results = action.payload.results;
          state.comparisons[index].cached_at = new Date().toISOString();
        }
        if (state.selectedComparison?.id === action.payload.comparisonId) {
          state.selectedComparison.cached_results = action.payload.results;
        }
      })
      .addCase(calculateComparison.rejected, (state) => {
        state.calculating = false;
      });
  }
});

export const {
  setSelectedComparison,
  clearSelectedComparison,
  clearComparisonsError,
  resetComparisonsState
} = dashboardComparisonsSlice.actions;

export default dashboardComparisonsSlice.reducer;
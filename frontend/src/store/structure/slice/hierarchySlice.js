import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hierarchyService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  currentVersion: null,
  history: [],
  validationResult: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

export const fetchHierarchyVersions = createAsyncThunk(
  'hierarchy/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy versions');
    }
  }
);

export const fetchHierarchyVersionById = createAsyncThunk(
  'hierarchy/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy version');
    }
  }
);

export const fetchCurrentHierarchyVersion = createAsyncThunk(
  'hierarchy/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getCurrent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch current hierarchy version');
    }
  }
);

export const fetchHierarchyHistory = createAsyncThunk(
  'hierarchy/fetchHistory',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getHistory(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy history');
    }
  }
);

export const validateHierarchy = createAsyncThunk(
  'hierarchy/validate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.validate();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate hierarchy');
    }
  }
);

export const captureHierarchySnapshot = createAsyncThunk(
  'hierarchy/capture',
  async (data, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.capture(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to capture hierarchy snapshot');
    }
  }
);

export const autoCaptureHierarchy = createAsyncThunk(
  'hierarchy/autoCapture',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.autoCapture();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to auto-capture hierarchy');
    }
  }
);

export const restoreHierarchyVersion = createAsyncThunk(
  'hierarchy/restore',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.restore(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to restore hierarchy version');
    }
  }
);

export const diffHierarchyVersions = createAsyncThunk(
  'hierarchy/diff',
  async ({ id, compareToId }, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.diff(id, compareToId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to diff hierarchy versions');
    }
  }
);

const hierarchySlice = createSlice({
  name: 'hierarchy',
  initialState,
  reducers: {
    clearHierarchyError: (state) => {
      state.error = null;
    },
    clearHierarchyCurrent: (state) => {
      state.currentItem = null;
    },
    resetHierarchyState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHierarchyVersions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHierarchyVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchHierarchyVersions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHierarchyVersionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHierarchyVersionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchHierarchyVersionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentHierarchyVersion.fulfilled, (state, action) => {
        state.currentVersion = action.payload;
      })
      .addCase(fetchHierarchyHistory.fulfilled, (state, action) => {
        state.history = action.payload.versions || action.payload;
      })
      .addCase(validateHierarchy.fulfilled, (state, action) => {
        state.validationResult = action.payload;
      })
      .addCase(captureHierarchySnapshot.fulfilled, (state, action) => {
        if (action.payload.version) {
          state.items.unshift(action.payload.version);
          state.totalCount += 1;
        }
      })
      .addCase(autoCaptureHierarchy.fulfilled, (state, action) => {
        if (action.payload.version_id) {
          state.currentVersion = action.payload;
        }
      });
  },
});

export const {
  clearHierarchyError,
  clearHierarchyCurrent,
  resetHierarchyState,
} = hierarchySlice.actions;

export default hierarchySlice.reducer;
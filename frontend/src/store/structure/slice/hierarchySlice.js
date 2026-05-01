import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hierarchyService } from '../../../services/structure/hierarchy.service';
import { initialHierarchyState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchHierarchyVersions = createAsyncThunk(
  'structure/hierarchy/fetchVersions',
  async ({ page = 1, pageSize = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize };
      const response = await hierarchyService.getVersionHistory(pageSize);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy versions');
    }
  }
);

export const fetchCurrentHierarchyVersion = createAsyncThunk(
  'structure/hierarchy/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getCurrentVersion();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch current hierarchy version');
    }
  }
);

export const fetchHierarchyVersionById = createAsyncThunk(
  'structure/hierarchy/fetchVersionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getVersion(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy version');
    }
  }
);

export const fetchHierarchyHealth = createAsyncThunk(
  'structure/hierarchy/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.getHealthMetrics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hierarchy health');
    }
  }
);

export const captureHierarchySnapshot = createAsyncThunk(
  'structure/hierarchy/captureSnapshot',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await hierarchyService.captureSnapshot(data);
      dispatch(showToast({ message: `Hierarchy snapshot captured as version ${response.data?.version_number}`, type: 'success' }));
      dispatch(fetchHierarchyVersions({}));
      dispatch(fetchCurrentHierarchyVersion());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to capture snapshot', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const restoreHierarchyVersion = createAsyncThunk(
  'structure/hierarchy/restoreVersion',
  async (versionId, { dispatch, rejectWithValue }) => {
    try {
      const response = await hierarchyService.restoreVersion(versionId);
      dispatch(showToast({ message: response.data?.message || 'Hierarchy restored successfully', type: 'success' }));
      dispatch(fetchHierarchyVersions({}));
      dispatch(fetchCurrentHierarchyVersion());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to restore hierarchy', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const validateHierarchy = createAsyncThunk(
  'structure/hierarchy/validate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.validateHierarchy();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate hierarchy');
    }
  }
);

export const detectHierarchyCycles = createAsyncThunk(
  'structure/hierarchy/detectCycles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hierarchyService.detectCycles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to detect cycles');
    }
  }
);

export const repairHierarchyCycles = createAsyncThunk(
  'structure/hierarchy/repairCycles',
  async (dryRun = true, { dispatch, rejectWithValue }) => {
    try {
      const response = await hierarchyService.repairCycles(dryRun);
      dispatch(showToast({ message: response.data?.message || 'Cycle repair completed', type: 'success' }));
      dispatch(validateHierarchy());
      dispatch(detectHierarchyCycles());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to repair cycles', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Hierarchy Slice
 */
const hierarchySlice = createSlice({
  name: 'structure/hierarchy',
  initialState: initialHierarchyState,
  reducers: {
    setHierarchyPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    
    setHierarchyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    
    clearHierarchyFilters: (state) => {
      state.filters = initialHierarchyState.filters;
      state.pagination.page = 1;
    },
    setHierarchyPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setSelectedVersion: (state, action) => {
      state.selectedVersion = action.payload;
    },
    clearSelectedVersion: (state) => {
      state.selectedVersion = null;
    },
    clearHierarchyHealth: (state) => {
      state.health = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHierarchyVersions.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchHierarchyVersions.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.versions = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.versions.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchHierarchyVersions.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchCurrentHierarchyVersion.fulfilled, (state, action) => {
        state.currentVersion = action.payload;
      })
      .addCase(fetchHierarchyVersionById.fulfilled, (state, action) => {
        state.selectedVersion = action.payload;
      })
      .addCase(fetchHierarchyHealth.fulfilled, (state, action) => {
        state.health = action.payload;
      })
      .addCase(captureHierarchySnapshot.fulfilled, (state, action) => {
        state.currentVersion = action.payload;
      })
      .addCase(restoreHierarchyVersion.fulfilled, (state, action) => {
        state.currentVersion = action.payload?.new_version || action.payload;
      })
      .addCase(validateHierarchy.fulfilled, (state, action) => {
        state.validation = action.payload;
      })
      .addCase(detectHierarchyCycles.fulfilled, (state, action) => {
        state.cycles = action.payload;
      });
  },
});

export const {
  setHierarchyPageSize,
  setHierarchyFilters,
  clearHierarchyFilters,
  setHierarchyPage,
  setSelectedVersion,
  clearSelectedVersion,
  clearHierarchyHealth,
} = hierarchySlice.actions;

export default hierarchySlice.reducer;
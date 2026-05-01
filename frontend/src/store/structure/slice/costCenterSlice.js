import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { costCenterService } from '../../../services/structure/costCenter.service';
import { initialCostCenterState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchCostCenters = createAsyncThunk(
  'structure/costCenters/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await costCenterService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost centers');
    }
  }
);

export const fetchCostCenterById = createAsyncThunk(
  'structure/costCenters/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center');
    }
  }
);

export const fetchCostCenterTree = createAsyncThunk(
  'structure/costCenters/fetchTree',
  async ({ includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const response = await costCenterService.getTree(includeInactive);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cost center tree');
    }
  }
);

export const createCostCenter = createAsyncThunk(
  'structure/costCenters/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await costCenterService.create(data);
      dispatch(showToast({ message: 'Cost center created successfully', type: 'success' }));
      dispatch(fetchCostCenters({}));
      dispatch(fetchCostCenterTree());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to create cost center', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateCostCenter = createAsyncThunk(
  'structure/costCenters/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await costCenterService.update(id, data);
      dispatch(showToast({ message: 'Cost center updated successfully', type: 'success' }));
      dispatch(fetchCostCenterById(id));
      dispatch(fetchCostCenters({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update cost center', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCostCenter = createAsyncThunk(
  'structure/costCenters/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await costCenterService.delete(id);
      dispatch(showToast({ message: 'Cost center deleted successfully', type: 'success' }));
      dispatch(fetchCostCenters({}));
      dispatch(fetchCostCenterTree());
      return id;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to delete cost center', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cost Center Slice
 */
const costCenterSlice = createSlice({
  name: 'structure/costCenters',
  initialState: initialCostCenterState,
  reducers: {
    setCostCenterPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setCostCenterPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setCostCenterFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearCostCenterFilters: (state) => {
      state.filters = initialCostCenterState.filters;
      state.pagination.page = 1;
    },
    clearSelectedCostCenter: (state) => {
      state.selectedCostCenter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostCenters.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchCostCenters.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchCostCenters.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchCostCenterById.fulfilled, (state, action) => {
        state.selectedCostCenter = action.payload;
      })
      .addCase(fetchCostCenterTree.fulfilled, (state, action) => {
        state.tree = action.payload;
      })
      .addCase(deleteCostCenter.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const {
  setCostCenterPage,
  setCostCenterPageSize,
  setCostCenterFilters,
  clearCostCenterFilters,
  clearSelectedCostCenter,
} = costCenterSlice.actions;

export default costCenterSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employmentService } from '../../../services/structure/employment.service';
import { initialEmploymentState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchEmployments = createAsyncThunk(
  'structure/employments/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await employmentService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employments');
    }
  }
);

export const fetchCurrentEmployments = createAsyncThunk(
  'structure/employments/fetchCurrent',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await employmentService.getCurrent(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch current employments');
    }
  }
);

export const fetchEmploymentById = createAsyncThunk(
  'structure/employments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employmentService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employment');
    }
  }
);

export const fetchEmploymentsByUser = createAsyncThunk(
  'structure/employments/fetchByUser',
  async ({ userId, includeHistory = true }, { rejectWithValue }) => {
    try {
      const response = await employmentService.getByUser(userId, includeHistory);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user employments');
    }
  }
);

export const fetchMyEmployment = createAsyncThunk(
  'structure/employments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employmentService.getMyEmployment();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch current employment');
    }
  }
);

export const createEmployment = createAsyncThunk(
  'structure/employments/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await employmentService.create(data);
      dispatch(showToast({ message: 'Employment created successfully', type: 'success' }));
      dispatch(fetchEmployments({}));
      dispatch(fetchCurrentEmployments({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to create employment', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployment = createAsyncThunk(
  'structure/employments/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await employmentService.update(id, data);
      dispatch(showToast({ message: 'Employment updated successfully', type: 'success' }));
      dispatch(fetchEmploymentById(id));
      dispatch(fetchEmployments({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update employment', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEmployment = createAsyncThunk(
  'structure/employments/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await employmentService.delete(id);
      dispatch(showToast({ message: 'Employment deleted successfully', type: 'success' }));
      dispatch(fetchEmployments({}));
      dispatch(fetchMyEmployment());
      return id;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to delete employment', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const transferEmployee = createAsyncThunk(
  'structure/employments/transfer',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await employmentService.transferEmployee(data);
      dispatch(showToast({ message: 'Employee transferred successfully', type: 'success' }));
      dispatch(fetchEmployments({}));
      dispatch(fetchMyEmployment());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to transfer employee', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

const employmentSlice = createSlice({
  name: 'structure/employments',
  initialState: initialEmploymentState,
  reducers: {
    setEmploymentPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setEmploymentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearEmploymentFilters: (state) => {
      state.filters = initialEmploymentState.filters;
      state.pagination.page = 1;
    },
    setEmploymentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedEmployment: (state) => {
      state.selectedEmployment = null;
    },
    clearCurrentEmployment: (state) => {
      state.currentEmployment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployments.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchEmployments.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchEmployments.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchCurrentEmployments.fulfilled, (state, action) => {
        state.items = action.payload?.results || action.payload || [];
      })
      .addCase(fetchEmploymentById.fulfilled, (state, action) => {
        state.selectedEmployment = action.payload;
      })
      .addCase(fetchMyEmployment.fulfilled, (state, action) => {
        state.currentEmployment = action.payload;
      })
      .addCase(deleteEmployment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentEmployment?.id === action.payload) {
          state.currentEmployment = null;
        }
      })
      .addCase(transferEmployee.fulfilled, (state) => {
        state.currentEmployment = null;
      });
  },
});

export const {
  setEmploymentPageSize,
  setEmploymentFilters,
  clearEmploymentFilters,
  setEmploymentPage,
  clearSelectedEmployment,
  clearCurrentEmployment,
} = employmentSlice.actions;

export default employmentSlice.reducer;
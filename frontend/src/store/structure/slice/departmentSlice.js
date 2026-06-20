import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentService } from '../../../services/structure/department.service';
import { initialDepartmentState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Fetch departments with pagination and filters
export const fetchDepartments = createAsyncThunk(
  'structure/departments/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await departmentService.list(params);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch departments';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'structure/departments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getById(id);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch department';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDepartmentTree = createAsyncThunk(
  'structure/departments/fetchTree',
  async ({ includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const response = await departmentService.getTree({ include_inactive: includeInactive });
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch department tree';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDepartmentStats = createAsyncThunk(
  'structure/departments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentService.getStats();
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to fetch department stats';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'structure/departments/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await departmentService.create(data);
      dispatch(showToast({ message: 'Department created successfully', type: 'success' }));
      dispatch(fetchDepartments({}));
      dispatch(fetchDepartmentTree({}));
      return response.data;
    } catch (error) {
      console.log('Full error object in createDepartment:', error);
      console.log('Raw error response data:', error?.rawResponse);
      // For envelope-style errors from structureApiClient
      let errorMessage = 'Failed to create department';
      if (error?.message && error.message !== 'An error occurred') {
        errorMessage = error.message;
      } else if (error?.errors && Object.keys(error.errors).length > 0) {
        const firstKey = Object.keys(error.errors)[0];
        const firstError = error.errors[firstKey];
        errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      } else if (error?.rawResponse) {
        const firstKey = Object.keys(error.rawResponse)[0];
        const firstError = error.rawResponse[firstKey];
        errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      }
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'structure/departments/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await departmentService.update(id, data);
      dispatch(showToast({ message: 'Department updated successfully', type: 'success' }));
      dispatch(fetchDepartmentById(id));
      dispatch(fetchDepartments({}));
      dispatch(fetchDepartmentTree({}));
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to update department';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'structure/departments/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await departmentService.delete(id);
      dispatch(showToast({ message: 'Department deleted successfully', type: 'success' }));
      dispatch(fetchDepartments({}));
      dispatch(fetchDepartmentTree({}));
      return id;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to delete department';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const moveDepartment = createAsyncThunk(
  'structure/departments/move',
  async ({ id, parentId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await departmentService.moveDepartment(id, parentId);
      dispatch(showToast({ message: 'Department moved successfully', type: 'success' }));
      dispatch(fetchDepartmentById(id));
      dispatch(fetchDepartmentTree({}));
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to move department';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkCreateDepartments = createAsyncThunk(
  'structure/departments/bulkCreate',
  async (departments, { dispatch, rejectWithValue }) => {
    try {
      const response = await departmentService.bulkCreate(departments);
      dispatch(showToast({ 
        message: `${response.data?.created_count || 0} departments created, ${response.data?.failed_count || 0} failed`,
        type: response.data?.failed_count > 0 ? 'warning' : 'success' 
      }));
      dispatch(fetchDepartments({}));
      dispatch(fetchDepartmentTree({}));
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Bulk create failed';
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

const departmentSlice = createSlice({
  name: 'structure/departments',
  initialState: initialDepartmentState,
  reducers: {
    setDepartmentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearDepartmentFilters: (state) => {
      state.filters = initialDepartmentState.filters;
      state.pagination.page = 1;
    },
    setDepartmentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setDepartmentPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = LoadingState.LOADING;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
    .addCase(fetchDepartmentById.pending, (state) => {
      state.loading = LoadingState.LOADING;
    })
    .addCase(fetchDepartmentById.fulfilled, (state, action) => {
      state.loading = LoadingState.SUCCEEDED;
      state.selectedDepartment = action.payload;
    })
    .addCase(fetchDepartmentById.rejected, (state, action) => {
      state.loading = LoadingState.FAILED;
      state.error = action.payload;
    })
    .addCase(fetchDepartmentTree.fulfilled, (state, action) => {
      state.tree = action.payload;
    })
    .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    })
    .addCase(updateDepartment.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload?.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    })
    .addCase(deleteDepartment.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.pagination.total = state.items.length;
    });
  },
});

// Export actions
export const {
  setDepartmentFilters,
  clearDepartmentFilters,
  setDepartmentPage,
  setDepartmentPageSize,
  clearSelectedDepartment,
} = departmentSlice.actions;
export default departmentSlice.reducer;
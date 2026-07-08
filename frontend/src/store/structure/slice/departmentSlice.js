import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  rootItems: [],
  stats: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
  hasFetched: false,
};

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await departmentService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch departments');
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department');
    }
  }
);

export const fetchRootDepartments = createAsyncThunk(
  'departments/fetchRoot',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentService.getRootDepartments();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch root departments');
    }
  }
);

export const fetchDepartmentStats = createAsyncThunk(
  'departments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department stats');
    }
  }
);

export const fetchDepartmentChildren = createAsyncThunk(
  'departments/fetchChildren',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getChildren(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department children');
    }
  }
);

export const fetchDepartmentSections = createAsyncThunk(
  'departments/fetchSections',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getSections(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department sections');
    }
  }
);

export const fetchDepartmentEmployments = createAsyncThunk(
  'departments/fetchEmployments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getEmployments(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department employments');
    }
  }
);

export const fetchDepartmentAncestors = createAsyncThunk(
  'departments/fetchAncestors',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.getAncestors(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department ancestors');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await departmentService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create department');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await departmentService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update department');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await departmentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete department');
    }
  }
);

export const moveDepartment = createAsyncThunk(
  'departments/move',
  async ({ id, parentId }, { rejectWithValue }) => {
    try {
      const response = await departmentService.moveDepartment(id, parentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to move department');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartmentCurrent: (state) => {
      state.currentItem = null;
    },
    setDepartmentFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setDepartmentPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetDepartmentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasFetched = true;
        state.items = action.payload.results || action.payload || [];
        state.totalCount = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRootDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRootDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rootItems = action.payload.root_departments || action.payload || [];
      })
      .addCase(fetchRootDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDepartmentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(moveDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentItem?.id === action.payload.department_id) {
          state.currentItem.parent_id = action.payload.new_parent_id;
        }
      })
      .addCase(moveDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDepartmentError,
  clearDepartmentCurrent,
  setDepartmentFilters,
  setDepartmentPagination,
  resetDepartmentState,
} = departmentSlice.actions;

export default departmentSlice.reducer;
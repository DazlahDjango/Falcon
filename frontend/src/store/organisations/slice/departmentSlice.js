import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentApi } from '../../../services/organisations/departmentService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all departments
 */
export const fetchDepartments = createAsyncThunk(
  'department/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await departmentApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

/**
 * Fetch department by ID
 */
export const fetchDepartmentById = createAsyncThunk(
  'department/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department');
    }
  }
);

/**
 * Fetch department tree (hierarchy)
 */
export const fetchDepartmentTree = createAsyncThunk(
  'department/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentApi.getTree();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department tree');
    }
  }
);

/**
 * Create department
 */
export const createDepartment = createAsyncThunk(
  'department/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await departmentApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create department');
    }
  }
);

/**
 * Update department
 */
export const updateDepartment = createAsyncThunk(
  'department/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await departmentApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update department');
    }
  }
);

/**
 * Delete department
 */
export const deleteDepartment = createAsyncThunk(
  'department/delete',
  async (id, { rejectWithValue }) => {
    try {
      await departmentApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete department');
    }
  }
);

/**
 * Move department
 */
export const moveDepartment = createAsyncThunk(
  'department/move',
  async ({ id, newParentId }, { rejectWithValue }) => {
    try {
      const response = await departmentApi.moveDepartment(id, newParentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move department');
    }
  }
);

/**
 * Set department manager
 */
export const setDepartmentManager = createAsyncThunk(
  'department/setManager',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await departmentApi.setManager(id, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set manager');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  departments: [],
  departmentTree: [],
  currentDepartment: null,
  loading: false,
  error: null,
  total: 0,
};

// ============================================================
// Slice
// ============================================================

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartments: (state) => {
      state.departments = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchDepartments
      // ============================================================
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchDepartmentTree
      // ============================================================
      .addCase(fetchDepartmentTree.fulfilled, (state, action) => {
        state.departmentTree = action.payload;
      })
      
      // ============================================================
      // fetchDepartmentById
      // ============================================================
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.currentDepartment = action.payload;
      })
      
      // ============================================================
      // createDepartment
      // ============================================================
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      
      // ============================================================
      // updateDepartment
      // ============================================================
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        if (state.currentDepartment?.id === action.payload.id) {
          state.currentDepartment = action.payload;
        }
      })
      
      // ============================================================
      // deleteDepartment
      // ============================================================
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(d => d.id !== action.payload);
        if (state.currentDepartment?.id === action.payload) {
          state.currentDepartment = null;
        }
      })
      
      // ============================================================
      // moveDepartment
      // ============================================================
      .addCase(moveDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      
      // ============================================================
      // setDepartmentManager
      // ============================================================
      .addCase(setDepartmentManager.fulfilled, (state, action) => {
        const index = state.departments.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        if (state.currentDepartment?.id === action.payload.id) {
          state.currentDepartment = action.payload;
        }
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearCurrentDepartment, clearDepartmentError, clearDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;
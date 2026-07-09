import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentTreeService } from '../../../services/structure';

const initialState = {
  tree: null,
  branch: null,
  path: null,
  subtree: null,
  lca: null,
  isLoading: false,
  error: null,
};

export const fetchDepartmentTree = createAsyncThunk(
  'departmentTree/fetchFull',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentTreeService.getTree();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department tree');
    }
  }
);

export const fetchDepartmentBranch = createAsyncThunk(
  'departmentTree/fetchBranch',
  async (departmentId, { rejectWithValue }) => {
    if (!departmentId) {
      return rejectWithValue('Department ID is required');
    }
    try {
      const response = await departmentTreeService.getBranch(departmentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department branch');
    }
  }
);

export const fetchDepartmentPath = createAsyncThunk(
  'departmentTree/fetchPath',
  async (departmentId, { rejectWithValue }) => {
    if (!departmentId) {
      return rejectWithValue('Department ID is required');
    }
    try {
      const response = await departmentTreeService.getPath(departmentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department path');
    }
  }
);

export const fetchDepartmentSubtree = createAsyncThunk(
  'departmentTree/fetchSubtree',
  async (departmentId, { rejectWithValue }) => {
    if (!departmentId) {
      return rejectWithValue('Department ID is required');
    }
    try {
      const response = await departmentTreeService.getSubtree(departmentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department subtree');
    }
  }
);

export const fetchDepartmentLCA = createAsyncThunk(
  'departmentTree/fetchLCA',
  async ({ deptA, deptB }, { rejectWithValue }) => {
    if (!deptA || !deptB) {
      return rejectWithValue('Both department IDs are required');
    }
    try {
      const response = await departmentTreeService.findLCA(deptA, deptB);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch LCA');
    }
  }
);

const departmentTreeSlice = createSlice({
  name: 'departmentTree',
  initialState,
  reducers: {
    clearDepartmentTreeError: (state) => {
      state.error = null;
    },
    resetDepartmentTreeState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentTree.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tree = action.payload;
      })
      .addCase(fetchDepartmentTree.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branch = action.payload;
      })
      .addCase(fetchDepartmentBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentPath.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentPath.fulfilled, (state, action) => {
        state.isLoading = false;
        state.path = action.payload;
      })
      .addCase(fetchDepartmentPath.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentSubtree.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentSubtree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subtree = action.payload;
      })
      .addCase(fetchDepartmentSubtree.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDepartmentLCA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentLCA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lca = action.payload;
      })
      .addCase(fetchDepartmentLCA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDepartmentTreeError,
  resetDepartmentTreeState,
} = departmentTreeSlice.actions;

export default departmentTreeSlice.reducer;
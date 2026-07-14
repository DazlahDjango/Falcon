import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frameworkService } from '../../../services/kpi';

// ============ Async Thunks ============

// Categories
export const fetchCategories = createAsyncThunk(
  'framework/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await frameworkService.getCategories(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'framework/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await frameworkService.createCategory(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'framework/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.updateCategory(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'framework/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await frameworkService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const moveCategory = createAsyncThunk(
  'framework/moveCategory',
  async ({ id, parentId }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.moveCategory(id, parentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reorderCategories = createAsyncThunk(
  'framework/reorderCategories',
  async (categories, { rejectWithValue }) => {
    try {
      const response = await frameworkService.reorderCategories(categories);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  categories: [],
  currentCategory: null,
  categoryTree: [],
  
  loading: false,
  submitting: false,
  error: null,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

// ============ Slice ============
const frameworkSlice = createSlice({
  name: 'framework',
  initialState,
  reducers: {
    clearCurrentFramework: (state) => {
      state.currentCategory = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setCategoryTree: (state, action) => {
      state.categoryTree = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.categories = Array.isArray(payload) ? payload : (payload?.results || []);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearCurrentFramework, clearErrors, setCategoryTree } = frameworkSlice.actions;
export default frameworkSlice.reducer;
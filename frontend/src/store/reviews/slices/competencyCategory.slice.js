// src/store/reviews/slices/competencyCategory.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competencyCategoryService } from '../../../services/reviews';

// ============ Competency Category Thunks ============
export const fetchCompetencyCategories = createAsyncThunk(
  'competencyCategories/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyCategoryService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyCategory = createAsyncThunk(
  'competencyCategories/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompetencyCategory = createAsyncThunk(
  'competencyCategories/create',
  async (data, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCompetencyCategory = createAsyncThunk(
  'competencyCategories/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompetencyCategory = createAsyncThunk(
  'competencyCategories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await competencyCategoryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCompetencyCategory = createAsyncThunk(
  'competencyCategories/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCompetencyCategory = createAsyncThunk(
  'competencyCategories/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategoryCompetencies = createAsyncThunk(
  'competencyCategories/fetchCompetencies',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.getCompetencies(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Category Slice ============
const competencyCategoryInitialState = {
  items: [],
  selectedItem: null,
  categoryCompetencies: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
};

const competencyCategorySlice = createSlice({
  name: 'competencyCategories',
  initialState: competencyCategoryInitialState,
  reducers: {
    resetCategoryState: (state) => {
      Object.assign(state, competencyCategoryInitialState);
    },
    setCategoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearCategoryFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setCategoryPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectCategory: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedItem = null;
    },
    clearCategoryErrors: (state) => {
      state.error = null;
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompetencyCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencyCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompetencyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetencyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCompetencyCategory.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(updateCompetencyCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deleteCompetencyCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(activateCompetencyCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deactivateCompetencyCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(fetchCategoryCompetencies.fulfilled, (state, action) => {
        state.categoryCompetencies = action.payload;
      });
  },
});

export const competencyCategoryReducer = competencyCategorySlice.reducer;
export const competencyCategoryActions = competencyCategorySlice.actions;
export const {
  resetCategoryState,
  setCategoryFilters,
  clearCategoryFilters,
  setCategoryPagination,
  selectCategory,
  clearSelectedCategory,
  clearCategoryErrors,
  updateItem,
} = competencyCategorySlice.actions;
export default competencyCategoryReducer;

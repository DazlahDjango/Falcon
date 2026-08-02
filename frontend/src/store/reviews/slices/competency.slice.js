// src/store/reviews/slices/competency.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competencyService } from '../../../services/reviews';

// ============ Competency Thunks ============
export const fetchCompetencies = createAsyncThunk(
  'competencies/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetency = createAsyncThunk(
  'competencies/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompetency = createAsyncThunk(
  'competencies/create',
  async (data, { rejectWithValue }) => {
    try {
      return await competencyService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCompetency = createAsyncThunk(
  'competencies/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await competencyService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchCompetency = createAsyncThunk(
  'competencies/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await competencyService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompetency = createAsyncThunk(
  'competencies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await competencyService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCompetency = createAsyncThunk(
  'competencies/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCompetency = createAsyncThunk(
  'competencies/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveCompetencies = createAsyncThunk(
  'competencies/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await competencyService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRequiredCompetencies = createAsyncThunk(
  'competencies/fetchRequired',
  async (_, { rejectWithValue }) => {
    try {
      return await competencyService.getRequired();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetenciesByType = createAsyncThunk(
  'competencies/fetchByType',
  async (type, { rejectWithValue }) => {
    try {
      return await competencyService.getByType(type);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyUsageStats = createAsyncThunk(
  'competencies/fetchUsageStats',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.getUsageStats(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Slice ============
const competencyInitialState = {
  items: [],
  selectedItem: null,
  usageStats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
  activeCompetencies: [],
  requiredCompetencies: [],
};

const competencySlice = createSlice({
  name: 'competencies',
  initialState: competencyInitialState,
  reducers: {
    resetCompetencyState: (state) => {
      Object.assign(state, competencyInitialState);
    },
    setCompetencyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearCompetencyFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setCompetencyPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectCompetency: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedCompetency: (state) => {
      state.selectedItem = null;
    },
    clearCompetencyErrors: (state) => {
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
      .addCase(fetchCompetencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencies.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompetency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetency.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCompetency.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(updateCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(patchCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = { ...state.selectedItem, ...action.payload };
        }
      })
      .addCase(deleteCompetency.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(activateCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deactivateCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(fetchActiveCompetencies.fulfilled, (state, action) => {
        state.activeCompetencies = action.payload;
      })
      .addCase(fetchRequiredCompetencies.fulfilled, (state, action) => {
        state.requiredCompetencies = action.payload;
      })
      .addCase(fetchCompetencyUsageStats.fulfilled, (state, action) => {
        state.usageStats = action.payload;
      });
  },
});

export const competencyReducer = competencySlice.reducer;
export const competencyActions = competencySlice.actions;
export const resetCompetencyState = competencySlice.actions.resetCompetencyState;
export const setCompetencyFilters = competencySlice.actions.setCompetencyFilters;
export const clearCompetencyFilters = competencySlice.actions.clearCompetencyFilters;
export const setCompetencyPagination = competencySlice.actions.setCompetencyPagination;
export default competencyReducer;
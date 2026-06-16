// src/store/reviews/slices/template.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewTemplateService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewTemplateService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTemplate = createAsyncThunk(
  'templates/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (data, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchTemplate = createAsyncThunk(
  'templates/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewTemplateService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setDefaultTemplate = createAsyncThunk(
  'templates/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.setDefault(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateTemplate = createAsyncThunk(
  'templates/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateTemplate = createAsyncThunk(
  'templates/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicate',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.duplicate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDefaultTemplate = createAsyncThunk(
  'templates/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.getDefault();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveTemplates = createAsyncThunk(
  'templates/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewTemplateService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  defaultTemplate: null,
  activeTemplates: [],
  duplicatedTemplate: null,
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

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelected: (state) => {
      state.selectedItem = null;
    },
    clearDuplicated: (state) => {
      state.duplicatedTemplate = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        if (state.defaultTemplate?.id === action.payload.id) {
          state.defaultTemplate = action.payload;
        }
        // Update in activeTemplates
        const activeIdx = state.activeTemplates.findIndex((item) => item.id === action.payload.id);
        if (activeIdx !== -1) {
          state.activeTemplates[activeIdx] = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Patch =====
    builder
      .addCase(patchTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = { ...state.selectedItem, ...action.payload };
        }
        if (state.defaultTemplate?.id === action.payload.id) {
          state.defaultTemplate = { ...state.defaultTemplate, ...action.payload };
        }
        // Update in activeTemplates
        const activeIdx = state.activeTemplates.findIndex((item) => item.id === action.payload.id);
        if (activeIdx !== -1) {
          state.activeTemplates[activeIdx] = { ...state.activeTemplates[activeIdx], ...action.payload };
        }
      })
      .addCase(patchTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        if (state.defaultTemplate?.id === action.payload) {
          state.defaultTemplate = null;
        }
        state.activeTemplates = state.activeTemplates.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Set Default =====
    builder
      .addCase(setDefaultTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultTemplate.fulfilled, (state, action) => {
        state.loading = false;
        // Update previous default
        if (state.defaultTemplate) {
          const prevIdx = state.items.findIndex((item) => item.id === state.defaultTemplate.id);
          if (prevIdx !== -1) {
            state.items[prevIdx] = { ...state.items[prevIdx], is_default: false };
          }
        }
        // Update new default
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        state.defaultTemplate = action.payload;
      })
      .addCase(setDefaultTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Activate =====
    builder
      .addCase(activateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Add to activeTemplates if not already there
        if (!state.activeTemplates.find((item) => item.id === action.payload.id)) {
          state.activeTemplates = [action.payload, ...state.activeTemplates];
        }
      })
      .addCase(activateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Deactivate =====
    builder
      .addCase(deactivateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Remove from activeTemplates
        state.activeTemplates = state.activeTemplates.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deactivateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Duplicate =====
    builder
      .addCase(duplicateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.duplicatedTemplate = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(duplicateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Default =====
    builder
      .addCase(fetchDefaultTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultTemplate = action.payload;
      })
      .addCase(fetchDefaultTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Active =====
    builder
      .addCase(fetchActiveTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTemplates = action.payload;
      })
      .addCase(fetchActiveTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const reviewTemplateReducer = templateSlice.reducer;
export const reviewTemplateActions = templateSlice.actions;
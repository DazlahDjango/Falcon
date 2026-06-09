import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frameworkService } from '../../../services/kpi';

// ============ Async Thunks ============

// Sectors
export const fetchSectors = createAsyncThunk(
  'framework/fetchSectors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await frameworkService.getSectors(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSector = createAsyncThunk(
  'framework/createSector',
  async (data, { rejectWithValue }) => {
    try {
      const response = await frameworkService.createSector(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSector = createAsyncThunk(
  'framework/updateSector',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.updateSector(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSector = createAsyncThunk(
  'framework/deleteSector',
  async (id, { rejectWithValue }) => {
    try {
      await frameworkService.deleteSector(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Frameworks
export const fetchFrameworks = createAsyncThunk(
  'framework/fetchFrameworks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await frameworkService.getFrameworks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFramework = createAsyncThunk(
  'framework/fetchFramework',
  async (id, { rejectWithValue }) => {
    try {
      const response = await frameworkService.getFramework(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFramework = createAsyncThunk(
  'framework/createFramework',
  async (data, { rejectWithValue }) => {
    try {
      const response = await frameworkService.createFramework(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFramework = createAsyncThunk(
  'framework/updateFramework',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.updateFramework(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFramework = createAsyncThunk(
  'framework/deleteFramework',
  async (id, { rejectWithValue }) => {
    try {
      await frameworkService.deleteFramework(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const publishFramework = createAsyncThunk(
  'framework/publishFramework',
  async (id, { rejectWithValue }) => {
    try {
      const response = await frameworkService.publishFramework(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const duplicateFramework = createAsyncThunk(
  'framework/duplicateFramework',
  async (id, { rejectWithValue }) => {
    try {
      const response = await frameworkService.duplicateFramework(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

// Templates
export const fetchTemplates = createAsyncThunk(
  'framework/fetchTemplates',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await frameworkService.getTemplates(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'framework/createTemplate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await frameworkService.createTemplate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'framework/updateTemplate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.updateTemplate(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'framework/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      await frameworkService.deleteTemplate(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const publishTemplate = createAsyncThunk(
  'framework/publishTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await frameworkService.publishTemplate(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const useTemplate = createAsyncThunk(
  'framework/useTemplate',
  async ({ id, frameworkId }, { rejectWithValue }) => {
    try {
      const response = await frameworkService.useTemplate(id, frameworkId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const archiveFramework = createAsyncThunk(
  'framework/archiveFramework',
  async (id, { rejectWithValue }) => {
    try {
      const response = await frameworkService.archiveFramework(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// ============ Initial State ============
const initialState = {
  sectors: [],
  currentSector: null,
  frameworks: [],
  currentFramework: null,
  categories: [],
  currentCategory: null,
  categoryTree: [],
  templates: [],
  currentTemplate: null,
  
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
      state.currentFramework = null;
      state.currentSector = null;
      state.currentCategory = null;
      state.currentTemplate = null;
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
      // Sectors
      .addCase(fetchSectors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.loading = false;
        // Handle DRF pagination object or direct array
        const payload = action.payload;
        state.sectors = Array.isArray(payload) ? payload : (payload?.results || []);
      })
      .addCase(fetchSectors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSector.fulfilled, (state, action) => {
        state.sectors.unshift(action.payload);
      })
      .addCase(updateSector.fulfilled, (state, action) => {
        const index = state.sectors.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.sectors[index] = action.payload;
      })
      .addCase(deleteSector.fulfilled, (state, action) => {
        state.sectors = state.sectors.filter(s => s.id !== action.payload);
      })
      
      // Frameworks
      .addCase(fetchFrameworks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFrameworks.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.frameworks = Array.isArray(payload) ? payload : (payload?.results || []);
        if (payload?.count) state.pagination.total = payload.count;
      })
      .addCase(fetchFrameworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFramework.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFramework.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFramework = action.payload;
      })
      .addCase(fetchFramework.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFramework.fulfilled, (state, action) => {
        state.frameworks.unshift(action.payload);
      })
      .addCase(updateFramework.fulfilled, (state, action) => {
        const index = state.frameworks.findIndex(f => f.id === action.payload.id);
        if (index !== -1) state.frameworks[index] = action.payload;
        if (state.currentFramework?.id === action.payload.id) state.currentFramework = action.payload;
      })
      .addCase(deleteFramework.fulfilled, (state, action) => {
        state.frameworks = state.frameworks.filter(f => f.id !== action.payload);
      })
      .addCase(archiveFramework.fulfilled, (state, action) => {
        const index = state.frameworks.findIndex(f => f.id === action.payload.id);
        if (index !== -1) state.frameworks[index] = action.payload;
        if (state.currentFramework?.id === action.payload.id) state.currentFramework = action.payload;
      })
      .addCase(duplicateFramework.fulfilled, (state, action) => {
        state.frameworks.unshift(action.payload);
      })
      
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
      })
      
      // Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.templates = Array.isArray(payload) ? payload : (payload?.results || []);
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.templates[index] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearCurrentFramework, clearErrors, setCategoryTree } = frameworkSlice.actions;
export default frameworkSlice.reducer;
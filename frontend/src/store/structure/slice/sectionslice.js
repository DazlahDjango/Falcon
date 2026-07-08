import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sectionService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchSections = createAsyncThunk(
  'sections/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sectionService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sections');
    }
  }
);

export const fetchSectionById = createAsyncThunk(
  'sections/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sectionService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch section');
    }
  }
);

export const fetchSectionUnits = createAsyncThunk(
  'sections/fetchUnits',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sectionService.getUnits(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch section units');
    }
  }
);

export const createSection = createAsyncThunk(
  'sections/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await sectionService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create section');
    }
  }
);

export const updateSection = createAsyncThunk(
  'sections/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await sectionService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update section');
    }
  }
);

export const deleteSection = createAsyncThunk(
  'sections/delete',
  async (id, { rejectWithValue }) => {
    try {
      await sectionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete section');
    }
  }
);

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearSectionError: (state) => {
      state.error = null;
    },
    clearSectionCurrent: (state) => {
      state.currentItem = null;
    },
    setSectionFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSectionPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetSectionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSectionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        const newSection = action.payload.data || action.payload;
        state.items.unshift(newSection);
        state.totalCount += 1;
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        const updatedSection = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedSection.id);
        if (index !== -1) {
          state.items[index] = updatedSection;
        }
        if (state.currentItem?.id === updatedSection.id) {
          state.currentItem = updatedSection;
        }
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearSectionError,
  clearSectionCurrent,
  setSectionFilters,
  setSectionPagination,
  resetSectionState,
} = sectionSlice.actions;

export default sectionSlice.reducer;
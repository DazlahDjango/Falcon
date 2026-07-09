import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organizationalUnitService } from '../../../services/structure';

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
};

export const fetchOrganizationalUnits = createAsyncThunk(
  'organizationalUnits/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organizational units');
    }
  }
);

export const fetchOrganizationalUnitById = createAsyncThunk(
  'organizationalUnits/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organizational unit');
    }
  }
);

export const fetchRootOrganizationalUnits = createAsyncThunk(
  'organizationalUnits/fetchRoot',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.getRootUnits();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch root organizational units');
    }
  }
);

export const fetchOrganizationalUnitStats = createAsyncThunk(
  'organizationalUnits/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organizational unit stats');
    }
  }
);

export const fetchOrganizationalUnitsByLevel = createAsyncThunk(
  'organizationalUnits/fetchByLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.getByLevel(level);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch organizational units by level: ${level}`);
    }
  }
);

export const createOrganizationalUnit = createAsyncThunk(
  'organizationalUnits/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create organizational unit');
    }
  }
);

export const updateOrganizationalUnit = createAsyncThunk(
  'organizationalUnits/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await organizationalUnitService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update organizational unit');
    }
  }
);

export const deleteOrganizationalUnit = createAsyncThunk(
  'organizationalUnits/delete',
  async (id, { rejectWithValue }) => {
    try {
      await organizationalUnitService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete organizational unit');
    }
  }
);

const organizationalUnitSlice = createSlice({
  name: 'organizationalUnits',
  initialState,
  reducers: {
    clearOrganizationalUnitError: (state) => {
      state.error = null;
    },
    clearOrganizationalUnitCurrent: (state) => {
      state.currentItem = null;
    },
    setOrganizationalUnitFilters: (state, action) => {
      state.filters = action.payload;
    },
    setOrganizationalUnitPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetOrganizationalUnitState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationalUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationalUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchOrganizationalUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganizationalUnitById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationalUnitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchOrganizationalUnitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRootOrganizationalUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRootOrganizationalUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rootItems = action.payload.results || action.payload;
      })
      .addCase(fetchRootOrganizationalUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganizationalUnitStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchOrganizationalUnitsByLevel.fulfilled, (state, action) => {
        state.items = action.payload.units || action.payload;
      })
      .addCase(createOrganizationalUnit.fulfilled, (state, action) => {
        const newUnit = action.payload.data || action.payload;
        state.items.unshift(newUnit);
        state.totalCount += 1;
      })
      .addCase(updateOrganizationalUnit.fulfilled, (state, action) => {
        const updatedUnit = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedUnit.id);
        if (index !== -1) {
          state.items[index] = updatedUnit;
        }
        if (state.currentItem?.id === updatedUnit.id) {
          state.currentItem = updatedUnit;
        }
      })
      .addCase(deleteOrganizationalUnit.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearOrganizationalUnitError,
  clearOrganizationalUnitCurrent,
  setOrganizationalUnitFilters,
  setOrganizationalUnitPagination,
  resetOrganizationalUnitState,
} = organizationalUnitSlice.actions;

export default organizationalUnitSlice.reducer;
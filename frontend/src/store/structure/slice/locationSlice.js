import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationService } from '../../../services/structure';

const initialState = {
  items: [],
  currentItem: null,
  headquarters: null,
  stats: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: { page: 1, pageSize: 20 },
};

export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await locationService.list(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch locations');
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'locations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch location');
    }
  }
);

export const fetchHeadquarters = createAsyncThunk(
  'locations/fetchHeadquarters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationService.getHeadquarters();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch headquarters');
    }
  }
);

export const fetchLocationStats = createAsyncThunk(
  'locations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch location stats');
    }
  }
);

export const fetchLocationSubLocations = createAsyncThunk(
  'locations/fetchSubLocations',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getSubLocations(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sub-locations');
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await locationService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create location');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await locationService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update location');
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await locationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete location');
    }
  }
);

export const updateLocationOccupancy = createAsyncThunk(
  'locations/updateOccupancy',
  async ({ id, occupancy }, { rejectWithValue }) => {
    try {
      const response = await locationService.updateOccupancy(id, occupancy);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update location occupancy');
    }
  }
);

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
    clearLocationCurrent: (state) => {
      state.currentItem = null;
    },
    setLocationFilters: (state, action) => {
      state.filters = action.payload;
    },
    setLocationPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetLocationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload.data || action.payload;
        state.items = responseData.results || responseData || [];
        state.totalCount = responseData.count || responseData.length || 0;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLocationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data || action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHeadquarters.fulfilled, (state, action) => {
        state.headquarters = action.payload;
      })
      .addCase(fetchLocationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        const newLocation = action.payload.data || action.payload;
        state.items.unshift(newLocation);
        state.totalCount += 1;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const updatedLocation = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedLocation.id);
        if (index !== -1) {
          state.items[index] = updatedLocation;
        }
        if (state.currentItem?.id === updatedLocation.id) {
          state.currentItem = updatedLocation;
        }
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const {
  clearLocationError,
  clearLocationCurrent,
  setLocationFilters,
  setLocationPagination,
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer;
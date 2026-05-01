import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationService } from '../../../services/structure/location.service';
import { initialLocationState, LoadingState } from './structureTypes';
import { showToast } from '../../ui/slices/uiSlice';

// Async Thunks
export const fetchLocations = createAsyncThunk(
  'structure/locations/fetch',
  async ({ page = 1, pageSize = 50, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, page_size: pageSize, ...filters };
      const response = await locationService.list(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch locations');
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'structure/locations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch location');
    }
  }
);

export const fetchLocationTree = createAsyncThunk(
  'structure/locations/fetchTree',
  async ({ includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const response = await locationService.getTree(includeInactive);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch location tree');
    }
  }
);

export const fetchHeadquarters = createAsyncThunk(
  'structure/locations/fetchHeadquarters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationService.getHeadquarters();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch headquarters');
    }
  }
);

export const createLocation = createAsyncThunk(
  'structure/locations/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await locationService.create(data);
      dispatch(showToast({ message: 'Location created successfully', type: 'success' }));
      dispatch(fetchLocations({}));
      dispatch(fetchLocationTree());
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to create location', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'structure/locations/update',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await locationService.update(id, data);
      dispatch(showToast({ message: 'Location updated successfully', type: 'success' }));
      dispatch(fetchLocationById(id));
      dispatch(fetchLocations({}));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update location', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'structure/locations/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await locationService.delete(id);
      dispatch(showToast({ message: 'Location deleted successfully', type: 'success' }));
      dispatch(fetchLocations({}));
      dispatch(fetchLocationTree());
      return id;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to delete location', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocationOccupancy = createAsyncThunk(
  'structure/locations/updateOccupancy',
  async ({ id, currentOccupancy }, { dispatch, rejectWithValue }) => {
    try {
      const response = await locationService.updateOccupancy(id, currentOccupancy);
      dispatch(showToast({ message: 'Occupancy updated successfully', type: 'success' }));
      dispatch(fetchLocationById(id));
      return response.data;
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Failed to update occupancy', type: 'error' }));
      return rejectWithValue(error.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'structure/locations',
  initialState: initialLocationState,
  reducers: {
    setLocationPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLocationPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setLocationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearLocationFilters: (state) => {
      state.filters = initialLocationState.filters;
      state.pagination.page = 1;
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = LoadingState.LOADING;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = LoadingState.SUCCEEDED;
        state.items = action.payload?.results || action.payload || [];
        state.pagination.total = action.payload?.count || state.items.length;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize);
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = LoadingState.FAILED;
        state.error = action.payload;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.selectedLocation = action.payload;
      })
      .addCase(fetchLocationTree.fulfilled, (state, action) => {
        state.tree = action.payload;
      })
      .addCase(fetchHeadquarters.fulfilled, (state, action) => {
        state.headquarters = action.payload;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.headquarters?.id === action.payload) {
          state.headquarters = null;
        }
      });
  },
});
export const {
  setLocationPage,
  setLocationPageSize,
  setLocationFilters,
  clearLocationFilters,
  clearSelectedLocation,
} = locationSlice.actions;
export default locationSlice.reducer;
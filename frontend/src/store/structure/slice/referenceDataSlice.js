import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { structureReferenceDataService } from '../../../services/structure';

const initialState = {
  data: null,
  counts: null,
  orgUnits: null,
  users: null,
  isLoading: false,
  error: null,
};

export const fetchReferenceData = createAsyncThunk(
  'referenceData/fetch',
  async (include, { rejectWithValue }) => {
    try {
      const response = await structureReferenceDataService.getReferenceData(include);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reference data');
    }
  }
);

export const fetchReferenceCounts = createAsyncThunk(
  'referenceData/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureReferenceDataService.getCounts();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reference counts');
    }
  }
);

export const fetchReferenceOrgUnits = createAsyncThunk(
  'referenceData/fetchOrgUnits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureReferenceDataService.getOrgUnits();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reference organizational units');
    }
  }
);

export const fetchReferenceUsers = createAsyncThunk(
  'referenceData/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await structureReferenceDataService.getUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reference users');
    }
  }
);

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    clearReferenceDataError: (state) => {
      state.error = null;
    },
    resetReferenceDataState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferenceData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReferenceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.counts = action.payload.counts;
        state.orgUnits = action.payload.organizational_units;
        state.users = action.payload.users;
      })
      .addCase(fetchReferenceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload?.message || action.payload?.detail || action.error?.message || 'An error occurred');
      })
      .addCase(fetchReferenceCounts.fulfilled, (state, action) => {
        state.counts = action.payload.counts || action.payload;
      })
      .addCase(fetchReferenceOrgUnits.fulfilled, (state, action) => {
        state.orgUnits = action.payload.organizational_units || action.payload;
      })
      .addCase(fetchReferenceUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || action.payload;
      });
  },
});

export const {
  clearReferenceDataError,
  resetReferenceDataState,
} = referenceDataSlice.actions;

export default referenceDataSlice.reducer;
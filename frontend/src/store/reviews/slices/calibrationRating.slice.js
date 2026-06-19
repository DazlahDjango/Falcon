// src/store/reviews/slices/calibrationRating.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  calibrationRatingService,
} from '../../../services/reviews';

// ============ Calibration Rating Thunks ============
export const fetchCalibrationRatings = createAsyncThunk(
  'calibrationRatings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await calibrationRatingService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationRating = createAsyncThunk(
  'calibrationRatings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await calibrationRatingService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationRatingsForSession = createAsyncThunk(
  'calibrationRatings/fetchForSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await calibrationRatingService.getForSession(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Calibration Rating Slice ============
const calibrationRatingInitialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
};

const calibrationRatingSlice = createSlice({
  name: 'calibrationRatings',
  initialState: calibrationRatingInitialState,
  reducers: {
    resetRatingState: (state) => {
      Object.assign(state, calibrationRatingInitialState);
    },
    setRatingPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectCalibrationRating: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedCalibrationRating: (state) => {
      state.selectedItem = null;
    },
    clearRatingErrors: (state) => {
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
      .addCase(fetchCalibrationRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrationRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCalibrationRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCalibrationRating.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(fetchCalibrationRatingsForSession.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const {
  resetRatingState,
  setRatingPagination,
  selectCalibrationRating,
  clearSelectedCalibrationRating,
  clearRatingErrors,
} = calibrationRatingSlice.actions;

export const calibrationRatingReducer = calibrationRatingSlice.reducer;
export const calibrationRatingActions = calibrationRatingSlice.actions;
export default calibrationRatingReducer;

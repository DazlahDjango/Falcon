// src/store/reviews/slices/calibrationSession.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  calibrationSessionService,
} from '../../../services/reviews';

// ============ Calibration Session Thunks ============
export const fetchCalibrationSessions = createAsyncThunk(
  'calibrationSessions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await calibrationSessionService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationSession = createAsyncThunk(
  'calibrationSessions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCalibrationSession = createAsyncThunk(
  'calibrationSessions/create',
  async (data, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCalibrationSession = createAsyncThunk(
  'calibrationSessions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCalibrationSession = createAsyncThunk(
  'calibrationSessions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await calibrationSessionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const startCalibrationSession = createAsyncThunk(
  'calibrationSessions/start',
  async (id, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.start(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completeCalibrationSession = createAsyncThunk(
  'calibrationSessions/complete',
  async ({ id, decisions, notes }, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.complete(id, decisions, notes);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelCalibrationSession = createAsyncThunk(
  'calibrationSessions/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.cancel(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCalibrationRating = createAsyncThunk(
  'calibrationSessions/addRating',
  async ({ sessionId, finalRatingId, beforeScore, afterScore, reason }, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.addRating(
        sessionId,
        finalRatingId,
        beforeScore,
        afterScore,
        reason
      );
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCalibrationComment = createAsyncThunk(
  'calibrationSessions/addComment',
  async ({ sessionId, comment, parentCommentId }, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.addComment(sessionId, comment, parentCommentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationReport = createAsyncThunk(
  'calibrationSessions/fetchReport',
  async (id, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.getReport(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyCalibrationSessions = createAsyncThunk(
  'calibrationSessions/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.getMy();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationOutliers = createAsyncThunk(
  'calibrationSessions/fetchOutliers',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.getOutliers(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationRecommendations = createAsyncThunk(
  'calibrationSessions/fetchRecommendations',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.getRecommendations(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCalibrationSessionsForCycle = createAsyncThunk(
  'calibrationSessions/fetchForCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      return await calibrationSessionService.getForCycle(cycleId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Calibration Session Slice ============
const calibrationSessionInitialState = {
  items: [],
  selectedItem: null,
  report: null,
  outliers: null,
  recommendations: null,
  mySessions: [],
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

const calibrationSessionSlice = createSlice({
  name: 'calibrationSessions',
  initialState: calibrationSessionInitialState,
  reducers: {
    resetSessionState: (state) => {
      Object.assign(state, calibrationSessionInitialState);
    },
    setSessionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearSessionFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setSessionPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectSession: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedSession: (state) => {
      state.selectedItem = null;
      state.report = null;
    },
    clearSessionErrors: (state) => {
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
      .addCase(fetchCalibrationSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrationSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCalibrationSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCalibrationSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrationSession.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCalibrationSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCalibrationSession.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(updateCalibrationSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deleteCalibrationSession.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(startCalibrationSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(completeCalibrationSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(cancelCalibrationSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(addCalibrationRating.fulfilled, (state, action) => {
        if (state.selectedItem) {
          state.selectedItem.rating_adjustments = [
            ...(state.selectedItem.rating_adjustments || []),
            action.payload,
          ];
        }
      })
      .addCase(addCalibrationComment.fulfilled, (state, action) => {
        if (state.selectedItem) {
          state.selectedItem.comments = [
            ...(state.selectedItem.comments || []),
            action.payload,
          ];
        }
      })
      .addCase(fetchCalibrationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrationReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchCalibrationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyCalibrationSessions.fulfilled, (state, action) => {
        state.mySessions = action.payload;
      })
      .addCase(fetchCalibrationOutliers.fulfilled, (state, action) => {
        state.outliers = action.payload;
      })
      .addCase(fetchCalibrationRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(fetchCalibrationSessionsForCycle.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const calibrationSessionReducer = calibrationSessionSlice.reducer;
export const calibrationSessionActions = calibrationSessionSlice.actions;
export const resetSessionState = calibrationSessionSlice.actions.resetSessionState;
export const setSessionFilters = calibrationSessionSlice.actions.setSessionFilters;
export const clearSessionFilters = calibrationSessionSlice.actions.clearSessionFilters;
export const setSessionPagination = calibrationSessionSlice.actions.setSessionPagination;
export default calibrationSessionReducer;

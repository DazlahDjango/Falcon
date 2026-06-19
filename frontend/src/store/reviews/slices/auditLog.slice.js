// src/store/reviews/slices/auditLog.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApiClient } from '../../../services/reviews';

// ============ Thunks ============

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewsApiClient.get('/audit-logs/', { params });
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuditLog = createAsyncThunk(
  'auditLogs/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewsApiClient.get(`/audit-logs/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuditLogsForObject = createAsyncThunk(
  'auditLogs/fetchForObject',
  async ({ modelName, objectId }, { rejectWithValue }) => {
    try {
      const response = await reviewsApiClient.get('/audit-logs/for-object/', {
        params: { model_name: modelName, object_id: objectId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuditLogsForUser = createAsyncThunk(
  'auditLogs/fetchForUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reviewsApiClient.get(`/audit-logs/for-user/${userId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  objectLogs: [],
  userLogs: [],
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

const auditLogSlice = createSlice({
  name: 'auditLogs',
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
    clearObjectLogs: (state) => {
      state.objectLogs = [];
    },
    clearUserLogs: (state) => {
      state.userLogs = [];
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchAuditLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch For Object =====
    builder
      .addCase(fetchAuditLogsForObject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogsForObject.fulfilled, (state, action) => {
        state.loading = false;
        state.objectLogs = action.payload;
      })
      .addCase(fetchAuditLogsForObject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch For User =====
    builder
      .addCase(fetchAuditLogsForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogsForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userLogs = action.payload;
      })
      .addCase(fetchAuditLogsForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const auditLogReducer = auditLogSlice.reducer;
export const auditLogActions = auditLogSlice.actions;
export const resetAuditLogState = auditLogSlice.actions.resetState;
export default auditLogReducer;
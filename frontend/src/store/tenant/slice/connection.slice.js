import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { connectionService } from '../../../services/tenant';

const initialState = {
  connections: [],
  currentConnection: null,
  tenantConnections: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  metrics: null,
  healthStatus: null,
  actionResult: null,
  debugTraces: null,
  debugLoading: false,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    organization_id: null,
    status: null,
  },
};

export const fetchConnections = createAsyncThunk(
  'connection/fetchConnections',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.connection?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await connectionService.getConnections(queryParams);
      return { data: response.data, page, pageSize };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConnection = createAsyncThunk(
  'connection/fetchConnection',
  async (id, { rejectWithValue }) => {
    try {
      const response = await connectionService.getConnection(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createConnection = createAsyncThunk(
  'connection/createConnection',
  async (data, { rejectWithValue }) => {
    try {
      const response = await connectionService.createConnection(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateConnection = createAsyncThunk(
  'connection/updateConnection',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await connectionService.updateConnection(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteConnection = createAsyncThunk(
  'connection/deleteConnection',
  async (id, { rejectWithValue }) => {
    try {
      await connectionService.deleteConnection(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const closeConnection = createAsyncThunk(
  'connection/closeConnection',
  async (id, { rejectWithValue }) => {
    try {
      const response = await connectionService.closeConnection(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConnectionStatus = createAsyncThunk(
  'connection/fetchConnectionStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await connectionService.getConnectionStatus(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const executeConnectionAction = createAsyncThunk(
  'connection/executeConnectionAction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await connectionService.executeAction(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConnectionMetrics = createAsyncThunk(
  'connection/fetchConnectionMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await connectionService.getMetrics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const runHealthCheck = createAsyncThunk(
  'connection/runHealthCheck',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await connectionService.healthCheck(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const pauseConnection = createAsyncThunk(
  'connection/pauseConnection',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await connectionService.pauseConnection(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resumeConnection = createAsyncThunk(
  'connection/resumeConnection',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await connectionService.resumeConnection(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDebugTraces = createAsyncThunk(
  'connection/fetchDebugTraces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getDebugTraces();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantConnections = createAsyncThunk(
  'connection/fetchTenantConnections',
  async ({ tenantId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await connectionService.getTenantConnections(tenantId, params);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const closeTenantConnection = createAsyncThunk(
  'connection/closeTenantConnection',
  async ({ tenantId, connectionId }, { rejectWithValue }) => {
    try {
      const response = await connectionService.closeTenantConnection(tenantId, connectionId);
      return { tenantId, connectionId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantConnectionStatus = createAsyncThunk(
  'connection/fetchTenantConnectionStatus',
  async ({ tenantId, connectionId }, { rejectWithValue }) => {
    try {
      const response = await connectionService.getTenantConnectionStatus(tenantId, connectionId);
      return { tenantId, connectionId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    clearCurrentConnection: (state) => {
      state.currentConnection = null;
      state.healthStatus = null;
      state.actionResult = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearMetrics: (state) => {
      state.metrics = null;
    },
    clearTenantConnections: (state, action) => {
      const { tenantId } = action.payload;
      delete state.tenantConnections[tenantId];
    },
    clearAllConnections: (state) => {
      state.connections = [];
      state.tenantConnections = {};
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.connections = results;
        const activePageSize = pageSize || state.pagination.pageSize || 20;
        const activePage = page || state.pagination.page || 1;
        const totalPages = Math.max(1, Math.ceil(total / activePageSize));

        state.pagination = {
          page: activePage,
          pageSize: activePageSize,
          total,
          totalPages,
        };
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchConnection.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchConnection.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentConnection = action.payload;
      })
      .addCase(fetchConnection.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createConnection.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.submitting = false;
        state.connections.unshift(action.payload);
        state.pagination.total += 1;
        if (action.payload.organization_id) {
          const key = action.payload.organization_id;
          if (state.tenantConnections[key]) {
            state.tenantConnections[key].unshift(action.payload);
          }
        }
      })
      .addCase(createConnection.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateConnection.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateConnection.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentConnection = action.payload;
        const index = state.connections.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.connections[index] = action.payload;
        Object.keys(state.tenantConnections).forEach((key) => {
          const idx = state.tenantConnections[key]?.findIndex(c => c.id === action.payload.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantConnections[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateConnection.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(c => c.id !== action.payload);
        state.pagination.total -= 1;
        Object.keys(state.tenantConnections).forEach((key) => {
          state.tenantConnections[key] = state.tenantConnections[key]?.filter(c => c.id !== action.payload) || [];
        });
      })
      .addCase(closeConnection.fulfilled, (state, action) => {
        state.actionResult = action.payload;
        const connection = action.payload.data;
        if (connection) {
          const index = state.connections.findIndex(c => c.id === connection.id);
          if (index !== -1) state.connections[index] = connection;
          Object.keys(state.tenantConnections).forEach((key) => {
            const idx = state.tenantConnections[key]?.findIndex(c => c.id === connection.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantConnections[key][idx] = connection;
            }
          });
          if (state.currentConnection?.id === connection.id) {
            state.currentConnection = connection;
          }
        }
      })
      .addCase(fetchConnectionStatus.fulfilled, (state, action) => {
        state.currentConnection = action.payload.data;
      })
      .addCase(executeConnectionAction.fulfilled, (state, action) => {
        state.actionResult = action.payload;
      })
      .addCase(fetchConnectionMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(runHealthCheck.fulfilled, (state, action) => {
        state.healthStatus = action.payload;
      })
      .addCase(pauseConnection.fulfilled, (state, action) => {
        state.actionResult = action.payload;
      })
      .addCase(resumeConnection.fulfilled, (state, action) => {
        state.actionResult = action.payload;
      })
      .addCase(fetchDebugTraces.pending, (state) => {
        state.debugLoading = true;
      })
      .addCase(fetchDebugTraces.fulfilled, (state, action) => {
        state.debugLoading = false;
        state.debugTraces = action.payload;
      })
      .addCase(fetchDebugTraces.rejected, (state, action) => {
        state.debugLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTenantConnections.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        state.tenantConnections[tenantId] = Array.isArray(data) ? data : (data?.results || []);
      })
      .addCase(closeTenantConnection.fulfilled, (state, action) => {
        const { tenantId, connectionId, data } = action.payload;
        const key = tenantId;
        if (state.tenantConnections[key]) {
          const idx = state.tenantConnections[key].findIndex(c => c.id === connectionId);
          if (idx !== -1) state.tenantConnections[key][idx] = data;
        }
        state.actionResult = { tenantId, connectionId, data };
      })
      .addCase(fetchTenantConnectionStatus.fulfilled, (state, action) => {
        const { tenantId, connectionId, data } = action.payload;
        const key = tenantId;
        if (state.tenantConnections[key]) {
          const idx = state.tenantConnections[key].findIndex(c => c.id === connectionId);
          if (idx !== -1) state.tenantConnections[key][idx] = data;
        }
      });
  },
});

export const {
  clearCurrentConnection,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearMetrics,
  clearTenantConnections,
  clearAllConnections,
} = connectionSlice.actions;

export default connectionSlice.reducer;
// frontend/src/store/tenant/slice/connectionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { connectionService } from '../../../services/tenant/connection.service';

// Async Thunks
export const fetchConnections = createAsyncThunk(
    'connections/fetchConnections',
    async (params, { rejectWithValue }) => {
        try {
            const response = await connectionService.listConnections(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTenantConnections = createAsyncThunk(
    'connections/fetchTenantConnections',
    async ({ tenantId, params }, { rejectWithValue }) => {
        try {
            const response = await connectionService.getTenantConnections(tenantId, params);
            return { tenantId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchConnectionDetails = createAsyncThunk(
    'connections/fetchConnectionDetails',
    async (connectionId, { rejectWithValue }) => {
        try {
            const response = await connectionService.getConnectionDetails(connectionId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchConnectionMetrics = createAsyncThunk(
    'connections/fetchConnectionMetrics',
    async (params, { rejectWithValue }) => {
        try {
            const response = await connectionService.getConnectionMetrics(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const performHealthCheck = createAsyncThunk(
    'connections/performHealthCheck',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await connectionService.healthCheck(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateConnectionStatus = createAsyncThunk(
    'connections/updateConnectionStatus',
    async ({ connectionId, statusData }, { rejectWithValue }) => {
        try {
            const response = await connectionService.updateStatus(connectionId, statusData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const closeConnection = createAsyncThunk(
    'connections/closeConnection',
    async (connectionId, { rejectWithValue }) => {
        try {
            const response = await connectionService.closeConnection(connectionId);
            return { connectionId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const executeManagerAction = createAsyncThunk(
    'connections/executeManagerAction',
    async (actionData, { rejectWithValue }) => {
        try {
            const response = await connectionService.managerAction(actionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const closeIdleConnections = createAsyncThunk(
    'connections/closeIdleConnections',
    async (idleMinutes, { rejectWithValue }) => {
        try {
            const response = await connectionService.closeIdleConnections(idleMinutes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    connections: [],
    currentConnection: null,
    metrics: null,
    healthStatus: {},
    loading: false,
    error: null,
    filters: {
        status: '',
        tenant_id: '',
        is_active: null,
        page: 1,
        page_size: 20,
    },
    pagination: {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
    },
    realtimeData: {},
    lastUpdated: null,
};

// Connection Slice
const connectionSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1; // Reset to first page when filters change
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pagination.page_size = action.payload;
            state.pagination.page = 1;
        },
        updateRealtimeData: (state, action) => {
            const { connectionId, data } = action.payload;
            state.realtimeData[connectionId] = {
                ...state.realtimeData[connectionId],
                ...data,
                updatedAt: new Date().toISOString(),
            };
            
            // Update in connections list if exists
            const index = state.connections.findIndex(c => c.id === connectionId);
            if (index !== -1) {
                state.connections[index] = { ...state.connections[index], ...data };
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch Connections
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.results || action.payload;
                state.pagination = {
                    total: action.payload.count || action.payload.length,
                    page: state.pagination.page,
                    page_size: state.pagination.page_size,
                    total_pages: Math.ceil((action.payload.count || action.payload.length) / state.pagination.page_size),
                };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            
            // Fetch Tenant Connections
            .addCase(fetchTenantConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.data.results || action.payload.data;
                state.pagination = {
                    total: action.payload.data.count || action.payload.data.length,
                    page: state.pagination.page,
                    page_size: state.pagination.page_size,
                    total_pages: Math.ceil((action.payload.data.count || action.payload.data.length) / state.pagination.page_size),
                };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchTenantConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            
            // Fetch Connection Details
            .addCase(fetchConnectionDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConnectionDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentConnection = action.payload;
            })
            .addCase(fetchConnectionDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            
            // Fetch Connection Metrics
            .addCase(fetchConnectionMetrics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConnectionMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchConnectionMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            
            // Perform Health Check
            .addCase(performHealthCheck.fulfilled, (state, action) => {
                state.healthStatus = {
                    ...state.healthStatus,
                    [action.payload.tenant_id]: action.payload,
                };
            })
            
            // Update Connection Status
            .addCase(updateConnectionStatus.fulfilled, (state, action) => {
                const index = state.connections.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.connections[index] = { ...state.connections[index], ...action.payload };
                }
                if (state.currentConnection?.id === action.payload.id) {
                    state.currentConnection = { ...state.currentConnection, ...action.payload };
                }
            })
            
            // Close Connection
            .addCase(closeConnection.fulfilled, (state, action) => {
                const index = state.connections.findIndex(c => c.id === action.payload.connectionId);
                if (index !== -1) {
                    state.connections[index] = { 
                        ...state.connections[index], 
                        status: 'closed',
                        closed_at: new Date().toISOString(),
                    };
                }
            })
            
            // Execute Manager Action
            .addCase(executeManagerAction.fulfilled, (state, action) => {
                if (action.payload.details?.connections_closed) {
                    // Refresh connections list after bulk action
                    state.needsRefresh = true;
                }
            });
    },
});

// Export actions
export const {
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    updateRealtimeData,
    clearError,
    resetState,
} = connectionSlice.actions;

export default connectionSlice.reducer;
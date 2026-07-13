import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { provisioningService, extractApiError } from '../../../services/tenant';

export const fetchProvisioningList = createAsyncThunk(
  'provision/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await provisioningService.listAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchFailedProvisionings = createAsyncThunk(
  'provision/fetchFailed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await provisioningService.listFailed();
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchInProgressProvisionings = createAsyncThunk(
  'provision/fetchInProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await provisioningService.listInProgress();
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchProvisioningStatus = createAsyncThunk(
  'provision/fetchStatus',
  async (orgId, { rejectWithValue }) => {
    try {
      if (!orgId) throw new Error('Organization ID is required');
      const response = await provisioningService.getStatus(orgId);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const triggerProvisioning = createAsyncThunk(
  'provision/trigger',
  async ({ orgId, force = false }, { rejectWithValue, dispatch }) => {
    try {
      if (!orgId) throw new Error('Organization ID is required');
      const response = await provisioningService.trigger(orgId, force);
      await dispatch(fetchProvisioningStatus(orgId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const retryProvisioning = createAsyncThunk(
  'provision/retry',
  async ({ orgId, force = false }, { rejectWithValue, dispatch }) => {
    try {
      if (!orgId) throw new Error('Organization ID is required');
      const response = await provisioningService.retry(orgId, force);
      await dispatch(fetchProvisioningStatus(orgId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const rollbackProvisioning = createAsyncThunk(
  'provision/rollback',
  async (orgId, { rejectWithValue, dispatch }) => {
    try {
      if (!orgId) throw new Error('Organization ID is required');
      const response = await provisioningService.rollback(orgId);
      await dispatch(fetchProvisioningStatus(orgId));
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

const initialState = {
  list: [],
  failed: [],
  inProgress: [],
  current: null,
  pagination: {
    count: 0,
    failedCount: 0,
    inProgressCount: 0,
  },
  filters: {
    status: null,
    ordering: '-created_at',
  },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
  lastTriggered: null,
  lastRetried: null,
  lastRolledBack: null,
};

const provisionSlice = createSlice({
  name: 'provision',
  initialState,
  reducers: {
    clearCurrentProvision: (state) => {
      state.current = null;
    },
    clearProvisionError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearActionError: (state) => {
      state.actionError = null;
    },
    setProvisionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetProvisionFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetProvisionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvisioningList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvisioningList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.results || action.payload || [];
        state.pagination.count = action.payload?.count ?? state.list.length;
      })
      .addCase(fetchProvisioningList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFailedProvisionings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFailedProvisionings.fulfilled, (state, action) => {
        state.loading = false;
        state.failed = action.payload?.results || action.payload || [];
        state.pagination.failedCount = action.payload?.count ?? state.failed.length;
      })
      .addCase(fetchFailedProvisionings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInProgressProvisionings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInProgressProvisionings.fulfilled, (state, action) => {
        state.loading = false;
        state.inProgress = action.payload?.results || action.payload || [];
        state.pagination.inProgressCount = action.payload?.count ?? state.inProgress.length;
      })
      .addCase(fetchInProgressProvisionings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProvisioningStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvisioningStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProvisioningStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(triggerProvisioning.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(triggerProvisioning.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastTriggered = {
          orgId: action.payload?.organization_id,
          message: action.payload?.message,
          timestamp: new Date().toISOString(),
        };
      })
      .addCase(triggerProvisioning.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(retryProvisioning.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(retryProvisioning.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastRetried = {
          orgId: action.payload?.organization_id,
          message: action.payload?.message,
          timestamp: new Date().toISOString(),
        };
        state.failed = state.failed.filter(
          (org) => org.id !== action.payload?.organization_id
        );
      })
      .addCase(retryProvisioning.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(rollbackProvisioning.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rollbackProvisioning.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastRolledBack = {
          orgId: action.payload?.organization_id,
          message: action.payload?.message,
          timestamp: new Date().toISOString(),
        };
        if (state.current?.id === action.payload?.organization_id) {
          state.current = { ...state.current, status: 'FAILED' };
        }
      })
      .addCase(rollbackProvisioning.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  clearCurrentProvision,
  clearProvisionError,
  clearActionError,
  setProvisionFilters,
  resetProvisionFilters,
  resetProvisionState,
} = provisionSlice.actions;

export default provisionSlice.reducer;

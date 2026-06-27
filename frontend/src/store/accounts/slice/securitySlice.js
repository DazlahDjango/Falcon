import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as securityApi from '../../../services/accounts/api/security';

const initialState = {
  loginAttempts: [],
  selectedLoginAttempt: null,
  tenantPolicy: null,
  lockoutSummary: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    result: '',
    failure_reason: '',
    identifier: '',
    ip_address: '',
    hours: 24,
  },
  // ========== WebSocket Security State ==========
  wsConnected: false,
  banner: null,
  securityEvents: [],
  forcedLogoutReason: null,
};

export const fetchLoginAttempts = createAsyncThunk(
  'security/fetchLoginAttempts',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.accountsSecurity.pagination;
      const filters = state.accountsSecurity.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await securityApi.getLoginAttempts(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch login attempts');
    }
  }
);

export const fetchLoginAttempt = createAsyncThunk(
  'security/fetchLoginAttempt',
  async (id, { rejectWithValue }) => {
    try {
      const response = await securityApi.getLoginAttempt(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch login attempt');
    }
  }
);

export const fetchTenantPolicy = createAsyncThunk(
  'security/fetchTenantPolicy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await securityApi.getTenantPolicy(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant policy');
    }
  }
);

export const fetchLockoutSummary = createAsyncThunk(
  'security/fetchLockoutSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await securityApi.getLockoutSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch lockout summary');
    }
  }
);

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearSecurityError: (state) => {
      state.error = null;
    },
    setSecurityFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setSecurityPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedLoginAttempt: (state) => {
      state.selectedLoginAttempt = null;
    },
    resetSecurity: () => initialState,

    // ========== WebSocket Security Actions ==========
    setSecurityWsConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    setSecurityBanner: (state, action) => {
      state.banner = {
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
    },
    clearSecurityBanner: (state) => {
      state.banner = null;
    },
    setSecurityEvent: (state, action) => {
      state.securityEvents = [
        {
          ...action.payload,
          id: Date.now(),
        },
        ...(state.securityEvents || []),
      ].slice(0, 100); // Keep last 100 events
    },
    setForcedLogoutReason: (state, action) => {
      state.forcedLogoutReason = action.payload;
    },
    clearForcedLogoutReason: (state) => {
      state.forcedLogoutReason = null;
    },
    clearSecurityEvents: (state) => {
      state.securityEvents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginAttempts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoginAttempts.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.loginAttempts = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchLoginAttempts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLoginAttempt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoginAttempt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLoginAttempt = action.payload;
      })
      .addCase(fetchLoginAttempt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTenantPolicy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantPolicy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenantPolicy = action.payload;
      })
      .addCase(fetchTenantPolicy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLockoutSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLockoutSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lockoutSummary = action.payload;
      })
      .addCase(fetchLockoutSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSecurityError,
  setSecurityFilters,
  setSecurityPage,
  clearSelectedLoginAttempt,
  resetSecurity,
  // ========== WebSocket Security Exports ==========
  setSecurityWsConnected,
  setSecurityBanner,
  clearSecurityBanner,
  setSecurityEvent,
  setForcedLogoutReason,
  clearForcedLogoutReason,
  clearSecurityEvents,
} = securitySlice.actions;

export default securitySlice.reducer;
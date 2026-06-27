import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sessionsApi from '../../../services/accounts/api/sessions';

const initialState = {
  sessions: [],
  selectedSession: null,
  activeSessions: [],
  currentSession: null,
  tenantActiveSessions: [],
  blacklistedTokens: [],
  isLoading: false,
  isTerminating: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    status: '',
    device_type: '',
    user: '',
  },
};

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.sessions.pagination;
      const filters = state.sessions.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await sessionsApi.getSessions(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sessions');
    }
  }
);

export const fetchSession = createAsyncThunk(
  'sessions/fetchSession',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.getSession(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch session');
    }
  }
);

export const terminateSession = createAsyncThunk(
  'sessions/terminateSession',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.terminateSession(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to terminate session');
    }
  }
);

export const fetchActiveSessions = createAsyncThunk(
  'sessions/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.getActiveSessions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch active sessions');
    }
  }
);

export const fetchCurrentSession = createAsyncThunk(
  'sessions/fetchCurrentSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.getCurrentSession();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch current session');
    }
  }
);

export const terminateAllSessions = createAsyncThunk(
  'sessions/terminateAllSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.terminateAllSessions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to terminate all sessions');
    }
  }
);

export const fetchTenantActiveSessions = createAsyncThunk(
  'sessions/fetchTenantActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.getTenantActiveSessions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tenant active sessions');
    }
  }
);

export const fetchBlacklistedTokens = createAsyncThunk(
  'sessions/fetchBlacklistedTokens',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.getBlacklistedTokens(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch blacklisted tokens');
    }
  }
);

export const blacklistToken = createAsyncThunk(
  'sessions/blacklistToken',
  async ({ tokenId, reason }, { rejectWithValue }) => {
    try {
      const response = await sessionsApi.blacklistToken(tokenId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to blacklist token');
    }
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearSessionError: (state) => {
      state.error = null;
    },
    setSessionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setSessionPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedSession: (state) => {
      state.selectedSession = null;
    },
    resetSessions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.sessions = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSession = action.payload;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(terminateSession.pending, (state) => {
        state.isTerminating = true;
        state.error = null;
      })
      .addCase(terminateSession.fulfilled, (state, action) => {
        state.isTerminating = false;
        state.sessions = state.sessions.filter(s => s.id !== action.payload.id);
        state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload.id);
        state.tenantActiveSessions = state.tenantActiveSessions.filter(s => s.id !== action.payload.id);
        if (state.selectedSession?.id === action.payload.id) {
          state.selectedSession = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(terminateSession.rejected, (state, action) => {
        state.isTerminating = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.activeSessions = action.payload.sessions || action.payload || [];
      })
      .addCase(fetchCurrentSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(terminateAllSessions.fulfilled, (state) => {
        state.activeSessions = [];
        state.tenantActiveSessions = [];
        state.sessions = [];
      })
      .addCase(fetchTenantActiveSessions.fulfilled, (state, action) => {
        state.tenantActiveSessions = action.payload.sessions || action.payload || [];
      })
      .addCase(fetchBlacklistedTokens.fulfilled, (state, action) => {
        const data = action.payload;
        state.blacklistedTokens = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(blacklistToken.fulfilled, (state, action) => {
        state.blacklistedTokens.unshift(action.payload);
        state.pagination.total += 1;
      });
  },
});

export const {
  clearSessionError,
  setSessionFilters,
  setSessionPage,
  clearSelectedSession,
  resetSessions,
} = sessionSlice.actions;

export default sessionSlice.reducer;
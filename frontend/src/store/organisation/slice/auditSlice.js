import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditApi } from '../../../services/organisation/auditService';

export const fetchAuditStats = createAsyncThunk(
  'audit/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await auditApi.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch audit stats');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch audit logs');
    }
  }
);

const auditSlice = createSlice({
  name: 'orgAudit',
  initialState: {
    logs: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuditError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchAuditStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchAuditStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAuditError } = auditSlice.actions;
export default auditSlice.reducer;

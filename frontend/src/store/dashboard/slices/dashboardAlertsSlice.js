import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAlertService } from '../../../services/dashboard/alert.service';

const initialState = {
  alerts: [],
  total: 0,
  loading: false,
  suppressing: false,
  error: null,
  lastFetched: null
};

export const fetchAlerts = createAsyncThunk(
  'dashboardAlerts/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardAlertService.getAlerts(filters);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch alerts');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch alerts');
    }
  }
);

export const createAlert = createAsyncThunk(
  'dashboardAlerts/create',
  async (alertData, { rejectWithValue }) => {
    try {
      const response = await dashboardAlertService.createAlert(alertData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create alert');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create alert');
    }
  }
);

export const updateAlert = createAsyncThunk(
  'dashboardAlerts/update',
  async ({ alertId, alertData }, { rejectWithValue }) => {
    try {
      const response = await dashboardAlertService.updateAlert(alertId, alertData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update alert');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update alert');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'dashboardAlerts/delete',
  async (alertId, { rejectWithValue }) => {
    try {
      const response = await dashboardAlertService.deleteAlert(alertId);
      if (response?.success) {
        return alertId;
      }
      return rejectWithValue(response?.message || 'Failed to delete alert');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete alert');
    }
  }
);

export const suppressAlert = createAsyncThunk(
  'dashboardAlerts/suppress',
  async ({ alertId, durationMinutes }, { rejectWithValue }) => {
    try {
      const response = await dashboardAlertService.suppressAlert(alertId, durationMinutes);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to suppress alert');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to suppress alert');
    }
  }
);

const dashboardAlertsSlice = createSlice({
  name: 'dashboardAlerts',
  initialState,
  reducers: {
    clearAlertsError: (state) => {
      state.error = null;
    },
    resetAlertsState: () => initialState,
    addLocalAlert: (state, action) => {
      state.alerts.unshift(action.payload);
      state.total += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length || 0;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alerts.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(a => a.id !== action.payload);
        state.total -= 1;
      })
      .addCase(suppressAlert.pending, (state) => {
        state.suppressing = true;
      })
      .addCase(suppressAlert.fulfilled, (state, action) => {
        state.suppressing = false;
        const index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      })
      .addCase(suppressAlert.rejected, (state) => {
        state.suppressing = false;
      });
  }
});

export const { clearAlertsError, resetAlertsState, addLocalAlert } = dashboardAlertsSlice.actions;
export default dashboardAlertsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kpiApi } from '../../../services/organisation/kpiService';

// ============================================================
// Async Thunks
// ============================================================

export const fetchKpiOverview = createAsyncThunk(
  'kpi/fetchOverview',
  async (params, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getOverview(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KPI overview');
    }
  }
);

export const fetchKpis = createAsyncThunk(
  'kpi/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KPIs');
    }
  }
);

export const fetchKpiById = createAsyncThunk(
  'kpi/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KPI');
    }
  }
);

export const createKpi = createAsyncThunk(
  'kpi/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await kpiApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create KPI');
    }
  }
);

export const updateKpi = createAsyncThunk(
  'kpi/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await kpiApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update KPI');
    }
  }
);

export const deleteKpi = createAsyncThunk(
  'kpi/delete',
  async (id, { rejectWithValue }) => {
    try {
      await kpiApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete KPI');
    }
  }
);

export const submitKpiActual = createAsyncThunk(
  'kpi/submitActual',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await kpiApi.submitActual(id, data);
      return { kpiId: id, actual: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit actual value');
    }
  }
);

export const fetchKpiPerformanceTrend = createAsyncThunk(
  'kpi/fetchPerformanceTrend',
  async (params, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getPerformanceTrend(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance trend');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  kpis: [],
  currentKpi: null,
  overview: null,
  performanceTrend: [],
  loading: false,
  error: null,
  total: 0,
};

// ============================================================
// Slice
// ============================================================

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    clearCurrentKpi: (state) => {
      state.currentKpi = null;
    },
    clearKpiError: (state) => {
      state.error = null;
    },
    clearKpis: (state) => {
      state.kpis = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchKpiOverview
      .addCase(fetchKpiOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpiOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchKpiOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchKpiPerformanceTrend
      .addCase(fetchKpiPerformanceTrend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpiPerformanceTrend.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceTrend = action.payload;
      })
      .addCase(fetchKpiPerformanceTrend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchKpis
      .addCase(fetchKpis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.loading = false;
        state.kpis = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchKpiById
      .addCase(fetchKpiById.fulfilled, (state, action) => {
        state.currentKpi = action.payload;
      })
      
      // createKpi
      .addCase(createKpi.fulfilled, (state, action) => {
        state.kpis.push(action.payload);
      })
      
      // updateKpi
      .addCase(updateKpi.fulfilled, (state, action) => {
        const index = state.kpis.findIndex(k => k.id === action.payload.id);
        if (index !== -1) {
          state.kpis[index] = action.payload;
        }
        if (state.currentKpi?.id === action.payload.id) {
          state.currentKpi = action.payload;
        }
      })
      
      // deleteKpi
      .addCase(deleteKpi.fulfilled, (state, action) => {
        state.kpis = state.kpis.filter(k => k.id !== action.payload);
        if (state.currentKpi?.id === action.payload) {
          state.currentKpi = null;
        }
      });
  },
});

export const { clearCurrentKpi, clearKpiError, clearKpis } = kpiSlice.actions;
export default kpiSlice.reducer;

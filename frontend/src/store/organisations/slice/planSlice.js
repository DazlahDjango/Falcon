import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { planApi } from '../../../services/organisations/planService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all subscription plans
 */
export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await planApi.list();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

/**
 * Fetch plan by ID
 */
export const fetchPlanById = createAsyncThunk(
  'plans/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await planApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plan');
    }
  }
);

/**
 * Subscribe to a plan
 */
export const subscribeToPlan = createAsyncThunk(
  'plans/subscribe',
  async ({ planId, billingCycle }, { rejectWithValue }) => {
    try {
      const response = await planApi.subscribe(planId, { billing_cycle: billingCycle });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to subscribe to plan');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  plans: [],
  currentPlan: null,
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearPlanError: (state) => {
      state.error = null;
    },
    clearPlans: (state) => {
      state.plans = [];
      state.currentPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchPlans
      // ============================================================
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.results || action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================================================
      // fetchPlanById
      // ============================================================
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.currentPlan = action.payload;
      })

      // ============================================================
      // subscribeToPlan
      // ============================================================
      .addCase(subscribeToPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(subscribeToPlan.fulfilled, (state, action) => {
        state.loading = false;
        // Update current subscription if needed
      })
      .addCase(subscribeToPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPlanError, clearPlans } = planSlice.actions;
export default planSlice.reducer;
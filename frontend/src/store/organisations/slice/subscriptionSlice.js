import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionApi } from '../../../services/organisations/subscriptionService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all subscription plans
 */
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getPlans();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

/**
 * Fetch current subscription
 */
export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getCurrent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

/**
 * Fetch subscription history
 */
export const fetchSubscriptionHistory = createAsyncThunk(
  'subscription/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

/**
 * Fetch invoices
 */
export const fetchInvoices = createAsyncThunk(
  'subscription/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getInvoices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

/**
 * Fetch payment methods
 */
export const fetchPaymentMethods = createAsyncThunk(
  'subscription/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getPaymentMethods();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

/**
 * Upgrade subscription
 */
export const upgradeSubscription = createAsyncThunk(
  'subscription/upgrade',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.upgrade(planId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upgrade failed');
    }
  }
);

/**
 * Cancel subscription
 */
export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.cancel();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cancellation failed');
    }
  }
);

/**
 * Reactivate subscription
 */
export const reactivateSubscription = createAsyncThunk(
  'subscription/reactivate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.reactivate();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Reactivation failed');
    }
  }
);

/**
 * Add payment method
 */
export const addPaymentMethod = createAsyncThunk(
  'subscription/addPaymentMethod',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.addPaymentMethod(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment method');
    }
  }
);

/**
 * Remove payment method
 */
export const removePaymentMethod = createAsyncThunk(
  'subscription/removePaymentMethod',
  async (id, { rejectWithValue }) => {
    try {
      await subscriptionApi.removePaymentMethod(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove payment method');
    }
  }
);

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = createAsyncThunk(
  'subscription/setDefaultPaymentMethod',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.setDefaultPaymentMethod(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default payment method');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  plans: [],
  currentSubscription: null,
  subscriptionHistory: [],
  invoices: [],
  paymentMethods: [],
  loading: false,
  error: null,
  totalInvoices: 0,
};

// ============================================================
// Slice
// ============================================================

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    clearSubscriptions: (state) => {
      state.currentSubscription = null;
      state.subscriptionHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchPlans
      // ============================================================
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload.results || action.payload;
      })
      
      // ============================================================
      // fetchCurrentSubscription
      // ============================================================
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchSubscriptionHistory
      // ============================================================
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.subscriptionHistory = action.payload.results || action.payload;
      })
      
      // ============================================================
      // fetchInvoices
      // ============================================================
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload.results || action.payload;
        state.totalInvoices = action.payload.count || action.payload.length;
      })
      
      // ============================================================
      // fetchPaymentMethods
      // ============================================================
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload.results || action.payload;
      })
      
      // ============================================================
      // upgradeSubscription
      // ============================================================
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      })
      
      // ============================================================
      // cancelSubscription
      // ============================================================
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      })
      
      // ============================================================
      // reactivateSubscription
      // ============================================================
      .addCase(reactivateSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      })
      
      // ============================================================
      // removePaymentMethod
      // ============================================================
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(m => m.id !== action.payload);
      })
      
      // ============================================================
      // setDefaultPaymentMethod
      // ============================================================
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.map(m => ({
          ...m,
          is_default: m.id === action.payload.id,
        }));
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearSubscriptionError, clearSubscriptions } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../../services/tenant';

const initialState = {
  superAdminDashboard: null,
  clientAdminDashboard: null,

  superAdminLoading: false,
  clientAdminLoading: false,

  loading: false,
  error: null,

  lastFetched: {
    superAdmin: null,
    clientAdmin: null,
  },
};


// ============================================================
// SUPER ADMIN DASHBOARD
// ============================================================

export const fetchSuperAdminDashboard = createAsyncThunk(
  'dashboard/fetchSuperAdminDashboard',

  async (_, { rejectWithValue }) => {
    try {
      const response =
        await dashboardService.getSuperAdminDashboard();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);


// ============================================================
// CLIENT ADMIN DASHBOARD
// ============================================================

export const fetchClientAdminDashboard = createAsyncThunk(
  'dashboard/fetchClientAdminDashboard',

  async (_, { rejectWithValue }) => {
    try {
      const response =
        await dashboardService.getClientAdminDashboard();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);


// ============================================================
// SLICE
// ============================================================

const dashboardSlice = createSlice({
  name: 'dashboard',

  initialState,

  reducers: {

    clearDashboard: (state) => {
      state.superAdminDashboard = null;
      state.clientAdminDashboard = null;

      state.superAdminLoading = false;
      state.clientAdminLoading = false;

      state.loading = false;
      state.error = null;

      state.lastFetched = {
        superAdmin: null,
        clientAdmin: null,
      };
    },

    clearSuperAdminDashboard: (state) => {
      state.superAdminDashboard = null;
      state.lastFetched.superAdmin = null;
    },

    clearClientAdminDashboard: (state) => {
      state.clientAdminDashboard = null;
      state.lastFetched.clientAdmin = null;
    },

    clearErrors: (state) => {
      state.error = null;
    },
  },


  extraReducers: (builder) => {

    // ======================================================
    // SUPER ADMIN
    // ======================================================

    builder

      .addCase(
        fetchSuperAdminDashboard.pending,
        (state) => {
          state.loading = true;
          state.superAdminLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchSuperAdminDashboard.fulfilled,
        (state, action) => {
          state.loading = false;
          state.superAdminLoading = false;

          state.superAdminDashboard =
            action.payload;

          state.lastFetched.superAdmin =
            Date.now();
        }
      )

      .addCase(
        fetchSuperAdminDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.superAdminLoading = false;

          state.error = action.payload;
        }
      );


    // ======================================================
    // CLIENT ADMIN
    // ======================================================

    builder

      .addCase(
        fetchClientAdminDashboard.pending,
        (state) => {
          state.loading = true;
          state.clientAdminLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchClientAdminDashboard.fulfilled,
        (state, action) => {
          state.loading = false;
          state.clientAdminLoading = false;

          state.clientAdminDashboard =
            action.payload;

          state.lastFetched.clientAdmin =
            Date.now();
        }
      )

      .addCase(
        fetchClientAdminDashboard.rejected,
        (state, action) => {
          state.loading = false;
          state.clientAdminLoading = false;

          state.error = action.payload;
        }
      );
  },
});


export const {
  clearDashboard,
  clearSuperAdminDashboard,
  clearClientAdminDashboard,
  clearErrors,
} = dashboardSlice.actions;


export default dashboardSlice.reducer;
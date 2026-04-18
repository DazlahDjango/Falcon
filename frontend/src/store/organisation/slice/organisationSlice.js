import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organisationApi } from '../../../services/organisation/organisationService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all organisations (Admin only)
 */
export const fetchOrganisations = createAsyncThunk(
  'organisation/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await organisationApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organisations');
    }
  }
);

/**
 * Fetch current user's organisation
 */
export const fetchCurrentOrganisation = createAsyncThunk(
  'organisation/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organisationApi.getCurrent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organisation');
    }
  }
);

/**
 * Fetch organisation by ID
 */
export const fetchOrganisationById = createAsyncThunk(
  'organisation/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organisationApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organisation');
    }
  }
);

/**
 * Update organisation
 */
export const updateOrganisation = createAsyncThunk(
  'organisation/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await organisationApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update organisation');
    }
  }
);

/**
 * Upload organisation logo
 */
export const uploadOrganisationLogo = createAsyncThunk(
  'organisation/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const response = await organisationApi.uploadLogo(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload logo');
    }
  }
);

/**
 * Register new organisation (public)
 */
export const registerOrganisation = createAsyncThunk(
  'organisation/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await organisationApi.register(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

/**
 * Approve organisation (Admin)
 */
export const approveOrganisation = createAsyncThunk(
  'organisation/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organisationApi.approve(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Approval failed');
    }
  }
);

/**
 * Suspend organisation (Admin)
 */
export const suspendOrganisation = createAsyncThunk(
  'organisation/suspend',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await organisationApi.suspend(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Suspension failed');
    }
  }
);

/**
 * Activate organisation (Admin)
 */
export const activateOrganisation = createAsyncThunk(
  'organisation/activate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organisationApi.activate(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Activation failed');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  organisations: [],
  currentOrganisation: null,
  loading: false,
  error: null,
  total: 0,
  stats: null,
  usage: null,
};

// ============================================================
// Slice
// ============================================================

const organisationSlice = createSlice({
  name: 'organisation',
  initialState,
  reducers: {
    clearCurrentOrganisation: (state) => {
      state.currentOrganisation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOrganisations: (state) => {
      state.organisations = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchOrganisations
      // ============================================================
      .addCase(fetchOrganisations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganisations.fulfilled, (state, action) => {
        state.loading = false;
        state.organisations = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchOrganisations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchCurrentOrganisation
      // ============================================================
      .addCase(fetchCurrentOrganisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentOrganisation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganisation = action.payload;
      })
      .addCase(fetchCurrentOrganisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchOrganisationById
      // ============================================================
      .addCase(fetchOrganisationById.fulfilled, (state, action) => {
        state.currentOrganisation = action.payload;
      })
      
      // ============================================================
      // updateOrganisation
      // ============================================================
      .addCase(updateOrganisation.fulfilled, (state, action) => {
        state.currentOrganisation = action.payload;
        const index = state.organisations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.organisations[index] = action.payload;
        }
      })
      
      // ============================================================
      // uploadOrganisationLogo
      // ============================================================
      .addCase(uploadOrganisationLogo.fulfilled, (state, action) => {
        if (state.currentOrganisation) {
          state.currentOrganisation.logo = action.payload.logo_url;
        }
      })
      
      // ============================================================
      // approveOrganisation
      // ============================================================
      .addCase(approveOrganisation.fulfilled, (state, action) => {
        const index = state.organisations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.organisations[index] = action.payload;
        }
        if (state.currentOrganisation?.id === action.payload.id) {
          state.currentOrganisation = action.payload;
        }
      })
      
      // ============================================================
      // suspendOrganisation
      // ============================================================
      .addCase(suspendOrganisation.fulfilled, (state, action) => {
        const index = state.organisations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.organisations[index] = action.payload;
        }
        if (state.currentOrganisation?.id === action.payload.id) {
          state.currentOrganisation = action.payload;
        }
      })
      
      // ============================================================
      // activateOrganisation
      // ============================================================
      .addCase(activateOrganisation.fulfilled, (state, action) => {
        const index = state.organisations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.organisations[index] = action.payload;
        }
        if (state.currentOrganisation?.id === action.payload.id) {
          state.currentOrganisation = action.payload;
        }
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearCurrentOrganisation, clearError, clearOrganisations } = organisationSlice.actions;
export default organisationSlice.reducer;
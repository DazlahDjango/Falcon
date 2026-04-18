import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { domainApi } from '../../../services/organisation/domainService';

// ============================================================
// Async Thunks
// ============================================================

/**
 * Fetch all domains
 */
export const fetchDomains = createAsyncThunk(
  'domain/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await domainApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch domains');
    }
  }
);

/**
 * Fetch domain by ID
 */
export const fetchDomainById = createAsyncThunk(
  'domain/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch domain');
    }
  }
);

/**
 * Create domain
 */
export const createDomain = createAsyncThunk(
  'domain/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await domainApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create domain');
    }
  }
);

/**
 * Update domain
 */
export const updateDomain = createAsyncThunk(
  'domain/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await domainApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update domain');
    }
  }
);

/**
 * Delete domain
 */
export const deleteDomain = createAsyncThunk(
  'domain/delete',
  async (id, { rejectWithValue }) => {
    try {
      await domainApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete domain');
    }
  }
);

/**
 * Verify domain
 */
export const verifyDomain = createAsyncThunk(
  'domain/verify',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainApi.verify(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

/**
 * Set primary domain
 */
export const setPrimaryDomain = createAsyncThunk(
  'domain/setPrimary',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainApi.setPrimary(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set primary domain');
    }
  }
);

/**
 * Renew SSL certificate
 */
export const renewSSL = createAsyncThunk(
  'domain/renewSSL',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainApi.renewSSL(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to renew SSL');
    }
  }
);

// ============================================================
// Initial State
// ============================================================

const initialState = {
  domains: [],
  currentDomain: null,
  loading: false,
  error: null,
  total: 0,
};

// ============================================================
// Slice
// ============================================================

const domainSlice = createSlice({
  name: 'domain',
  initialState,
  reducers: {
    clearCurrentDomain: (state) => {
      state.currentDomain = null;
    },
    clearDomainError: (state) => {
      state.error = null;
    },
    clearDomains: (state) => {
      state.domains = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================================
      // fetchDomains
      // ============================================================
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false;
        state.domains = action.payload.results || action.payload;
        state.total = action.payload.count || action.payload.length;
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ============================================================
      // fetchDomainById
      // ============================================================
      .addCase(fetchDomainById.fulfilled, (state, action) => {
        state.currentDomain = action.payload;
      })
      
      // ============================================================
      // createDomain
      // ============================================================
      .addCase(createDomain.fulfilled, (state, action) => {
        state.domains.push(action.payload);
      })
      
      // ============================================================
      // updateDomain
      // ============================================================
      .addCase(updateDomain.fulfilled, (state, action) => {
        const index = state.domains.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.domains[index] = action.payload;
        }
        if (state.currentDomain?.id === action.payload.id) {
          state.currentDomain = action.payload;
        }
      })
      
      // ============================================================
      // deleteDomain
      // ============================================================
      .addCase(deleteDomain.fulfilled, (state, action) => {
        state.domains = state.domains.filter(d => d.id !== action.payload);
        if (state.currentDomain?.id === action.payload) {
          state.currentDomain = null;
        }
      })
      
      // ============================================================
      // verifyDomain
      // ============================================================
      .addCase(verifyDomain.fulfilled, (state, action) => {
        const index = state.domains.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.domains[index] = action.payload;
        }
        if (state.currentDomain?.id === action.payload.id) {
          state.currentDomain = action.payload;
        }
      })
      
      // ============================================================
      // setPrimaryDomain
      // ============================================================
      .addCase(setPrimaryDomain.fulfilled, (state, action) => {
        // Update all domains - only the selected one should be primary
        state.domains = state.domains.map(d => ({
          ...d,
          is_primary: d.id === action.payload.id,
        }));
        if (state.currentDomain) {
          state.currentDomain.is_primary = state.currentDomain.id === action.payload.id;
        }
      })
      
      // ============================================================
      // renewSSL
      // ============================================================
      .addCase(renewSSL.fulfilled, (state, action) => {
        const index = state.domains.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.domains[index] = action.payload;
        }
        if (state.currentDomain?.id === action.payload.id) {
          state.currentDomain = action.payload;
        }
      });
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const { clearCurrentDomain, clearDomainError, clearDomains } = domainSlice.actions;
export default domainSlice.reducer;
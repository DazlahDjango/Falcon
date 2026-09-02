import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { domainService } from '../../../services/tenant';

const initialState = {
  domains: [],
  currentDomain: null,
  tenantDomains: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  verificationResult: null,
  sslRenewalResult: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    organization_id: null,
    status: null,
    is_primary: null,
    search: '',
  },
  expiringSSL: [],
  domainStats: null,
};

export const fetchDomains = createAsyncThunk(
  'domain/fetchDomains',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.domain?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await domainService.getDomains(queryParams);
      return { data: response.data, page, pageSize };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDomain = createAsyncThunk(
  'domain/fetchDomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainService.getDomain(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDomain = createAsyncThunk(
  'domain/createDomain',
  async (data, { rejectWithValue }) => {
    try {
      const response = await domainService.createDomain(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDomain = createAsyncThunk(
  'domain/updateDomain',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await domainService.updateDomain(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDomain = createAsyncThunk(
  'domain/deleteDomain',
  async (id, { rejectWithValue }) => {
    try {
      await domainService.deleteDomain(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyDomain = createAsyncThunk(
  'domain/verifyDomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainService.verifyDomain(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setPrimaryDomain = createAsyncThunk(
  'domain/setPrimaryDomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainService.setPrimaryDomain(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const renewSSL = createAsyncThunk(
  'domain/renewSSL',
  async (id, { rejectWithValue }) => {
    try {
      const response = await domainService.renewSSL(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantDomains = createAsyncThunk(
  'domain/fetchTenantDomains',
  async ({ tenantId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await domainService.getTenantDomains(tenantId, params);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExpiringSSL = createAsyncThunk(
  'domain/fetchExpiringSSL',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await domainService.getExpiringSSL(days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyAllPendingDomains = createAsyncThunk(
  'domain/verifyAllPendingDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await domainService.verifyAllPending();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDomainStats = createAsyncThunk(
  'domain/fetchDomainStats',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await domainService.getDomainStats(tenantId);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const domainSlice = createSlice({
  name: 'domain',
  initialState,
  reducers: {
    clearCurrentDomain: (state) => {
      state.currentDomain = null;
      state.verificationResult = null;
      state.sslRenewalResult = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearTenantDomains: (state, action) => {
      const { tenantId } = action.payload;
      delete state.tenantDomains[tenantId];
    },
    clearAllDomains: (state) => {
      state.domains = [];
      state.tenantDomains = {};
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.domains = results;
        const activePageSize = pageSize || state.pagination.pageSize || 20;
        const activePage = page || state.pagination.page || 1;
        const totalPages = Math.max(1, Math.ceil(total / activePageSize));

        state.pagination = {
          page: activePage,
          pageSize: activePageSize,
          total,
          totalPages,
        };
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDomain.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchDomain.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentDomain = action.payload;
      })
      .addCase(fetchDomain.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createDomain.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createDomain.fulfilled, (state, action) => {
        state.submitting = false;
        state.domains.unshift(action.payload);
        state.pagination.total += 1;
        if (action.payload.organization_id) {
          const key = action.payload.organization_id;
          if (state.tenantDomains[key]) {
            state.tenantDomains[key].unshift(action.payload);
          }
        }
      })
      .addCase(createDomain.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateDomain.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateDomain.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentDomain = action.payload;
        const index = state.domains.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.domains[index] = action.payload;
        Object.keys(state.tenantDomains).forEach((key) => {
          const idx = state.tenantDomains[key]?.findIndex(d => d.id === action.payload.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantDomains[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateDomain.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteDomain.fulfilled, (state, action) => {
        state.domains = state.domains.filter(d => d.id !== action.payload);
        state.pagination.total -= 1;
        Object.keys(state.tenantDomains).forEach((key) => {
          state.tenantDomains[key] = state.tenantDomains[key]?.filter(d => d.id !== action.payload) || [];
        });
      })
      .addCase(verifyDomain.fulfilled, (state, action) => {
        state.verificationResult = action.payload;
        const domain = action.payload.data;
        if (domain) {
          const index = state.domains.findIndex(d => d.id === domain.id);
          if (index !== -1) state.domains[index] = domain;
          Object.keys(state.tenantDomains).forEach((key) => {
            const idx = state.tenantDomains[key]?.findIndex(d => d.id === domain.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantDomains[key][idx] = domain;
            }
          });
          if (state.currentDomain?.id === domain.id) {
            state.currentDomain = domain;
          }
        }
      })
      .addCase(setPrimaryDomain.fulfilled, (state, action) => {
        const domain = action.payload;
        const index = state.domains.findIndex(d => d.id === domain.id);
        if (index !== -1) state.domains[index] = domain;
        Object.keys(state.tenantDomains).forEach((key) => {
          const idx = state.tenantDomains[key]?.findIndex(d => d.id === domain.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantDomains[key][idx] = domain;
          }
        });
        if (state.currentDomain?.id === domain.id) {
          state.currentDomain = domain;
        }
      })
      .addCase(renewSSL.fulfilled, (state, action) => {
        state.sslRenewalResult = action.payload;
        const domain = action.payload.data;
        if (domain) {
          const index = state.domains.findIndex(d => d.id === domain.id);
          if (index !== -1) state.domains[index] = domain;
          Object.keys(state.tenantDomains).forEach((key) => {
            const idx = state.tenantDomains[key]?.findIndex(d => d.id === domain.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantDomains[key][idx] = domain;
            }
          });
          if (state.currentDomain?.id === domain.id) {
            state.currentDomain = domain;
          }
        }
      })
      .addCase(fetchTenantDomains.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        state.tenantDomains[tenantId] = Array.isArray(data) ? data : (data?.results || []);
      })
      .addCase(fetchExpiringSSL.fulfilled, (state, action) => {
        state.expiringSSL = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(fetchDomainStats.fulfilled, (state, action) => {
        state.domainStats = action.payload;
      })
      .addCase(verifyAllPendingDomains.fulfilled, (state, action) => {
        state.verificationResult = action.payload;
      });
  },
});

export const {
  clearCurrentDomain,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantDomains,
  clearAllDomains,
} = domainSlice.actions;

export default domainSlice.reducer;
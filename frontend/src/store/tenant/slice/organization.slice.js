import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { organizationService, extractApiError } from '../../../services/tenant';

const initialState = {
  organizations: [],
  currentOrganization: null,
  adminOrganizations: [],
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    is_active: null,
    is_onboarded: null,
    sector_id: null,
    subscription_tier: null,
    search: '',
  },
  usageSummary: null,
  provisioningStatus: null,
  adminPagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  adminFilters: {
    status: null,
    is_active: null,
    is_onboarded: null,
    search: '',
  },
};

export const fetchOrganizations = createAsyncThunk(
  'organization/fetchOrganizations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganizations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchOrganization = createAsyncThunk(
  'organization/fetchOrganization',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organization/createOrganization',
  async (data, { rejectWithValue }) => {
    try {
      const response = await organizationService.createOrganization(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organization/updateOrganization',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await organizationService.updateOrganization(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  'organization/deleteOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.deleteOrganization(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const onboardOrganization = createAsyncThunk(
  'organization/onboardOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.onboardOrganization(id);
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const activateOrganization = createAsyncThunk(
  'organization/activateOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.activateOrganization(id);
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const suspendOrganization = createAsyncThunk(
  'organization/suspendOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.suspendOrganization(id);
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchProvisioningStatus = createAsyncThunk(
  'organization/fetchProvisioningStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationService.getProvisioningStatus(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchUsageSummary = createAsyncThunk(
  'organization/fetchUsageSummary',
  async (id, { rejectWithValue }) => {
    try {
      const response = await organizationService.getUsageSummary(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchAdminOrganizations = createAsyncThunk(
  'organization/fetchAdminOrganizations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await organizationService.getAdminOrganizations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const forceSuspendOrganization = createAsyncThunk(
  'organization/forceSuspendOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.forceSuspend(id);
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const forceActivateOrganization = createAsyncThunk(
  'organization/forceActivateOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.forceActivate(id);
      const response = await organizationService.getOrganization(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const forceDeleteOrganization = createAsyncThunk(
  'organization/forceDeleteOrganization',
  async (id, { rejectWithValue }) => {
    try {
      await organizationService.forceDelete(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
      state.usageSummary = null;
      state.provisioningStatus = null;
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
    setAdminFilters: (state, action) => {
      state.adminFilters = { ...state.adminFilters, ...action.payload };
      state.adminPagination.page = 1;
    },
    resetAdminFilters: (state) => {
      state.adminFilters = initialState.adminFilters;
      state.adminPagination.page = 1;
    },
    setAdminPagination: (state, action) => {
      state.adminPagination = { ...state.adminPagination, ...action.payload };
    },
    clearAllOrganizations: (state) => {
      state.organizations = [];
      state.adminOrganizations = [];
      state.pagination = initialState.pagination;
      state.adminPagination = initialState.adminPagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.organizations = Array.isArray(payload) ? payload : (payload?.results || []);
        if (payload?.count) {
          state.pagination.total = payload.count;
          state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrganization.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentOrganization = action.payload;
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createOrganization.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.submitting = false;
        state.organizations.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateOrganization.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentOrganization = action.payload;
        const index = state.organizations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.organizations[index] = action.payload;
        const adminIndex = state.adminOrganizations.findIndex(o => o.id === action.payload.id);
        if (adminIndex !== -1) state.adminOrganizations[adminIndex] = action.payload;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter(o => o.id !== action.payload);
        state.adminOrganizations = state.adminOrganizations.filter(o => o.id !== action.payload);
        state.pagination.total -= 1;
        state.adminPagination.total -= 1;
      })
      .addCase(onboardOrganization.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(onboardOrganization.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentOrganization = action.payload;
        const index = state.organizations.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.organizations[index] = action.payload;
        const adminIndex = state.adminOrganizations.findIndex((o) => o.id === action.payload.id);
        if (adminIndex !== -1) state.adminOrganizations[adminIndex] = action.payload;
      })
      .addCase(onboardOrganization.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(activateOrganization.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentOrganization = action.payload;
        const index = state.organizations.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.organizations[index] = action.payload;
        const adminIndex = state.adminOrganizations.findIndex((o) => o.id === action.payload.id);
        if (adminIndex !== -1) state.adminOrganizations[adminIndex] = action.payload;
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(suspendOrganization.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(suspendOrganization.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentOrganization = action.payload;
        const index = state.organizations.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.organizations[index] = action.payload;
        const adminIndex = state.adminOrganizations.findIndex((o) => o.id === action.payload.id);
        if (adminIndex !== -1) state.adminOrganizations[adminIndex] = action.payload;
      })
      .addCase(suspendOrganization.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchProvisioningStatus.fulfilled, (state, action) => {
        state.provisioningStatus = action.payload;
      })
      .addCase(fetchUsageSummary.fulfilled, (state, action) => {
        state.usageSummary = action.payload;
      })
      .addCase(fetchAdminOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.adminOrganizations = Array.isArray(payload) ? payload : (payload?.results || []);
        if (payload?.count) {
          state.adminPagination.total = payload.count;
          state.adminPagination.totalPages = Math.ceil(payload.count / state.adminPagination.pageSize);
        }
      })
      .addCase(fetchAdminOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forceSuspendOrganization.fulfilled, (state, action) => {
        const index = state.adminOrganizations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.adminOrganizations[index] = action.payload;
        const orgIndex = state.organizations.findIndex(o => o.id === action.payload.id);
        if (orgIndex !== -1) state.organizations[orgIndex] = action.payload;
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(forceActivateOrganization.fulfilled, (state, action) => {
        const index = state.adminOrganizations.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.adminOrganizations[index] = action.payload;
        const orgIndex = state.organizations.findIndex(o => o.id === action.payload.id);
        if (orgIndex !== -1) state.organizations[orgIndex] = action.payload;
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(forceDeleteOrganization.fulfilled, (state, action) => {
        state.adminOrganizations = state.adminOrganizations.filter(o => o.id !== action.payload);
        state.organizations = state.organizations.filter(o => o.id !== action.payload);
        state.adminPagination.total -= 1;
        state.pagination.total -= 1;
        if (state.currentOrganization?.id === action.payload) {
          state.currentOrganization = null;
          state.usageSummary = null;
          state.provisioningStatus = null;
        }
      });
  },
});

export const {
  clearCurrentOrganization,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  setAdminFilters,
  resetAdminFilters,
  setAdminPagination,
  clearAllOrganizations,
} = organizationSlice.actions;

export default organizationSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourceService } from '../../../services/tenant';

const initialState = {
  resources: [],
  currentResource: null,
  tenantResources: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  resetResult: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    organization_id: null,
    resource_type: null,
    is_exceeded: null,
    is_warning: null,
  },
  resourceUsage: null,
  summary: [],
  analytics: {},
  exceededList: [],
  syncResult: null,
};

export const fetchResources = createAsyncThunk(
  'resource/fetchResources',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.resource?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await resourceService.getResources(queryParams);
      return { data: response.data, page, pageSize };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchResource = createAsyncThunk(
  'resource/fetchResource',
  async (id, { rejectWithValue }) => {
    try {
      const response = await resourceService.getResource(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createResource = createAsyncThunk(
  'resource/createResource',
  async (data, { rejectWithValue }) => {
    try {
      const response = await resourceService.createResource(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateResource = createAsyncThunk(
  'resource/updateResource',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await resourceService.updateResource(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resource/deleteResource',
  async (id, { rejectWithValue }) => {
    try {
      await resourceService.deleteResource(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetResource = createAsyncThunk(
  'resource/resetResource',
  async (id, { rejectWithValue }) => {
    try {
      const response = await resourceService.resetResource(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetDailyLimits = createAsyncThunk(
  'resource/resetDailyLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourceService.resetDailyLimits();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantResources = createAsyncThunk(
  'resource/fetchTenantResources',
  async ({ tenantId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await resourceService.getTenantResources(tenantId, params);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchResourceUsage = createAsyncThunk(
  'resource/fetchResourceUsage',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await resourceService.getResourceUsage(tenantId);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetTenantResource = createAsyncThunk(
  'resource/resetTenantResource',
  async ({ tenantId, resourceId }, { rejectWithValue }) => {
    try {
      const response = await resourceService.resetTenantResource(tenantId, resourceId);
      return { tenantId, resourceId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const incrementUsage = createAsyncThunk(
  'resource/incrementUsage',
  async ({ id, amount = 1 }, { rejectWithValue }) => {
    try {
      const response = await resourceService.incrementUsage(id, amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const decrementUsage = createAsyncThunk(
  'resource/decrementUsage',
  async ({ id, amount = 1 }, { rejectWithValue }) => {
    try {
      const response = await resourceService.decrementUsage(id, amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const takeSnapshot = createAsyncThunk(
  'resource/takeSnapshot',
  async ({ id, snapshotType = 'daily', periodLabel = null }, { rejectWithValue }) => {
    try {
      const response = await resourceService.takeSnapshot(id, snapshotType, periodLabel);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchResourceSummary = createAsyncThunk(
  'resource/fetchResourceSummary',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await resourceService.getResourceSummary(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchResourceAnalytics = createAsyncThunk(
  'resource/fetchResourceAnalytics',
  async ({ organizationId, resourceType, days = 7 }, { rejectWithValue }) => {
    try {
      const response = await resourceService.getResourceAnalytics(organizationId, resourceType, days);
      return { resourceType, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const syncResourcesFromBilling = createAsyncThunk(
  'resource/syncResourcesFromBilling',
  async (organizationId = null, { rejectWithValue }) => {
    try {
      const response = await resourceService.syncFromBilling(organizationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkIncrementResources = createAsyncThunk(
  'resource/bulkIncrementResources',
  async ({ organizationId, increments }, { rejectWithValue }) => {
    try {
      const response = await resourceService.bulkIncrement(organizationId, increments);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExceededResources = createAsyncThunk(
  'resource/fetchExceededResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourceService.getExceededResources();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    clearCurrentResource: (state) => {
      state.currentResource = null;
      state.resetResult = null;
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
    clearTenantResources: (state, action) => {
      const { tenantId } = action.payload;
      delete state.tenantResources[tenantId];
    },
    clearAllResources: (state) => {
      state.resources = [];
      state.tenantResources = {};
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.resources = results;
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
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchResource.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchResource.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentResource = action.payload;
      })
      .addCase(fetchResource.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createResource.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.submitting = false;
        state.resources.unshift(action.payload);
        state.pagination.total += 1;
        if (action.payload.organization_id) {
          const key = action.payload.organization_id;
          if (state.tenantResources[key]) {
            state.tenantResources[key].unshift(action.payload);
          }
        }
      })
      .addCase(createResource.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateResource.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentResource = action.payload;
        const index = state.resources.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.resources[index] = action.payload;
        Object.keys(state.tenantResources).forEach((key) => {
          const idx = state.tenantResources[key]?.findIndex(r => r.id === action.payload.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantResources[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(r => r.id !== action.payload);
        state.pagination.total -= 1;
        Object.keys(state.tenantResources).forEach((key) => {
          state.tenantResources[key] = state.tenantResources[key]?.filter(r => r.id !== action.payload) || [];
        });
      })
      .addCase(resetResource.fulfilled, (state, action) => {
        state.resetResult = action.payload;
        const resource = action.payload.data;
        if (resource) {
          const index = state.resources.findIndex(r => r.id === resource.id);
          if (index !== -1) state.resources[index] = resource;
          Object.keys(state.tenantResources).forEach((key) => {
            const idx = state.tenantResources[key]?.findIndex(r => r.id === resource.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantResources[key][idx] = resource;
            }
          });
          if (state.currentResource?.id === resource.id) {
            state.currentResource = resource;
          }
        }
      })
      .addCase(resetDailyLimits.fulfilled, (state, action) => {
        state.resetResult = { daily: action.payload };
      })
      .addCase(fetchTenantResources.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        state.tenantResources[tenantId] = Array.isArray(data) ? data : (data?.results || []);
      })
      .addCase(fetchResourceUsage.fulfilled, (state, action) => {
        state.resourceUsage = action.payload;
      })
      .addCase(resetTenantResource.fulfilled, (state, action) => {
        const { tenantId, resourceId, data } = action.payload;
        const key = tenantId;
        if (state.tenantResources[key]) {
          const idx = state.tenantResources[key].findIndex(r => r.id === resourceId);
          if (idx !== -1) state.tenantResources[key][idx] = data;
        }
        state.resetResult = { tenantId, resourceId, data };
      })
      // --- Enterprise Thunks ---
      .addCase(incrementUsage.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          const idx = state.resources.findIndex(r => r.id === updated.id);
          if (idx !== -1) state.resources[idx] = updated;
          if (state.currentResource?.id === updated.id) state.currentResource = updated;
        }
      })
      .addCase(decrementUsage.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          const idx = state.resources.findIndex(r => r.id === updated.id);
          if (idx !== -1) state.resources[idx] = updated;
          if (state.currentResource?.id === updated.id) state.currentResource = updated;
        }
      })
      .addCase(takeSnapshot.fulfilled, (state, action) => {
        // Snapshot is a record of history; no local state mutation required
        // Could store last snapshot time in currentResource if needed
      })
      .addCase(fetchResourceSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchResourceAnalytics.fulfilled, (state, action) => {
        const { resourceType, data } = action.payload;
        state.analytics[resourceType] = data;
      })
      .addCase(syncResourcesFromBilling.fulfilled, (state, action) => {
        state.syncResult = action.payload;
      })
      .addCase(bulkIncrementResources.fulfilled, (state, action) => {
        const { results } = action.payload || {};
        if (Array.isArray(results)) {
          results.forEach(updated => {
            if (updated?.id) {
              const idx = state.resources.findIndex(r => r.id === updated.id);
              if (idx !== -1) state.resources[idx] = updated;
            }
          });
        }
      })
      .addCase(fetchExceededResources.fulfilled, (state, action) => {
        state.exceededList = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.results || []);
      });
  },
});

export const {
  clearCurrentResource,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantResources,
  clearAllResources,
} = resourceSlice.actions;

export default resourceSlice.reducer;
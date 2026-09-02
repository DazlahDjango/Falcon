import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { schemaService } from '../../../services/tenant';

const initialState = {
  schemas: [],
  currentSchema: null,
  tenantSchemas: {},
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
    organization_id: null,
    status: null,
    is_ready: null,
    search: '',
  },
  schemaStats: null,
  provisioningResult: null,
};

export const fetchSchemas = createAsyncThunk(
  'schema/fetchSchemas',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPagination = state.schema?.pagination || { page: 1, pageSize: 20 };
      const page = params.page || currentPagination.page || 1;
      const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
      const limit = pageSize;
      const offset = (page - 1) * pageSize;

      const queryParams = { limit, offset, page, page_size: pageSize, ...params };
      const response = await schemaService.getSchemas(queryParams);
      return { data: response.data, page, pageSize };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSchema = createAsyncThunk(
  'schema/fetchSchema',
  async (id, { rejectWithValue }) => {
    try {
      const response = await schemaService.getSchema(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSchema = createAsyncThunk(
  'schema/createSchema',
  async (data, { rejectWithValue }) => {
    try {
      const response = await schemaService.createSchema(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSchema = createAsyncThunk(
  'schema/updateSchema',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await schemaService.updateSchema(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSchema = createAsyncThunk(
  'schema/deleteSchema',
  async (id, { rejectWithValue }) => {
    try {
      await schemaService.deleteSchema(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const provisionSchema = createAsyncThunk(
  'schema/provisionSchema',
  async (id, { rejectWithValue }) => {
    try {
      const response = await schemaService.provisionSchema(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const dropSchema = createAsyncThunk(
  'schema/dropSchema',
  async (id, { rejectWithValue }) => {
    try {
      const response = await schemaService.dropSchema(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSchemaStats = createAsyncThunk(
  'schema/updateSchemaStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await schemaService.updateSchemaStats(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantSchemas = createAsyncThunk(
  'schema/fetchTenantSchemas',
  async ({ tenantId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await schemaService.getTenantSchemas(tenantId, params);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSchemaStats = createAsyncThunk(
  'schema/fetchSchemaStats',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await schemaService.getSchemaStats(tenantId);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const provisionTenantSchema = createAsyncThunk(
  'schema/provisionTenantSchema',
  async ({ tenantId, schemaId }, { rejectWithValue }) => {
    try {
      const response = await schemaService.provisionTenantSchema(tenantId, schemaId);
      return { tenantId, schemaId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const dropTenantSchema = createAsyncThunk(
  'schema/dropTenantSchema',
  async ({ tenantId, schemaId }, { rejectWithValue }) => {
    try {
      const response = await schemaService.dropTenantSchema(tenantId, schemaId);
      return { tenantId, schemaId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    clearCurrentSchema: (state) => {
      state.currentSchema = null;
      state.provisioningResult = null;
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
    clearTenantSchemas: (state, action) => {
      const { tenantId } = action.payload;
      delete state.tenantSchemas[tenantId];
    },
    clearAllSchemas: (state) => {
      state.schemas = [];
      state.tenantSchemas = {};
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchemas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchemas.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, pageSize } = action.payload || {};
        const results = Array.isArray(data) ? data : (data?.results || []);
        const total = data?.count != null ? data.count : (Array.isArray(data) ? data.length : results.length);

        state.schemas = results;
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
      .addCase(fetchSchemas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSchema.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchSchema.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentSchema = action.payload;
      })
      .addCase(fetchSchema.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createSchema.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createSchema.fulfilled, (state, action) => {
        state.submitting = false;
        state.schemas.unshift(action.payload);
        state.pagination.total += 1;
        if (action.payload.organization_id) {
          const key = action.payload.organization_id;
          if (state.tenantSchemas[key]) {
            state.tenantSchemas[key].unshift(action.payload);
          }
        }
      })
      .addCase(createSchema.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateSchema.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateSchema.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSchema = action.payload;
        const index = state.schemas.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.schemas[index] = action.payload;
        Object.keys(state.tenantSchemas).forEach((key) => {
          const idx = state.tenantSchemas[key]?.findIndex(s => s.id === action.payload.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantSchemas[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateSchema.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteSchema.fulfilled, (state, action) => {
        state.schemas = state.schemas.filter(s => s.id !== action.payload);
        state.pagination.total -= 1;
        Object.keys(state.tenantSchemas).forEach((key) => {
          state.tenantSchemas[key] = state.tenantSchemas[key]?.filter(s => s.id !== action.payload) || [];
        });
      })
      .addCase(provisionSchema.fulfilled, (state, action) => {
        state.provisioningResult = action.payload;
        const schema = action.payload.data;
        if (schema) {
          const index = state.schemas.findIndex(s => s.id === schema.id);
          if (index !== -1) state.schemas[index] = schema;
          Object.keys(state.tenantSchemas).forEach((key) => {
            const idx = state.tenantSchemas[key]?.findIndex(s => s.id === schema.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantSchemas[key][idx] = schema;
            }
          });
          if (state.currentSchema?.id === schema.id) {
            state.currentSchema = schema;
          }
        }
      })
      .addCase(dropSchema.fulfilled, (state, action) => {
        const schema = action.payload.data;
        if (schema) {
          const index = state.schemas.findIndex(s => s.id === schema.id);
          if (index !== -1) state.schemas[index] = schema;
          Object.keys(state.tenantSchemas).forEach((key) => {
            const idx = state.tenantSchemas[key]?.findIndex(s => s.id === schema.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantSchemas[key][idx] = schema;
            }
          });
          if (state.currentSchema?.id === schema.id) {
            state.currentSchema = schema;
          }
        }
      })
      .addCase(updateSchemaStats.fulfilled, (state, action) => {
        const schema = action.payload.data;
        if (schema) {
          const index = state.schemas.findIndex(s => s.id === schema.id);
          if (index !== -1) state.schemas[index] = schema;
          if (state.currentSchema?.id === schema.id) {
            state.currentSchema = schema;
          }
        }
      })
      .addCase(fetchTenantSchemas.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        state.tenantSchemas[tenantId] = Array.isArray(data) ? data : (data?.results || []);
      })
      .addCase(fetchSchemaStats.fulfilled, (state, action) => {
        state.schemaStats = action.payload;
      })
      .addCase(provisionTenantSchema.fulfilled, (state, action) => {
        const { tenantId, schemaId, data } = action.payload;
        const key = tenantId;
        if (state.tenantSchemas[key]) {
          const idx = state.tenantSchemas[key].findIndex(s => s.id === schemaId);
          if (idx !== -1) state.tenantSchemas[key][idx] = data;
        }
        state.provisioningResult = { tenantId, schemaId, data };
      })
      .addCase(dropTenantSchema.fulfilled, (state, action) => {
        const { tenantId, schemaId, data } = action.payload;
        const key = tenantId;
        if (state.tenantSchemas[key]) {
          const idx = state.tenantSchemas[key].findIndex(s => s.id === schemaId);
          if (idx !== -1) state.tenantSchemas[key][idx] = data;
        }
      });
  },
});

export const {
  clearCurrentSchema,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantSchemas,
  clearAllSchemas,
} = schemaSlice.actions;

export default schemaSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { migrationService } from '../../../services/tenant';

const initialState = {
  migrations: [],
  currentMigration: null,
  tenantMigrations: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  syncing: false,
  previewing: false,
  rollingBack: false,
  sqlPreview: null,
  error: null,
  stats: null,
  applyResult: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    organization_id: null,
    app_name: null,
    status: null,
  },
};

export const fetchMigrations = createAsyncThunk(
  'migration/fetchMigrations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await migrationService.getMigrations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMigration = createAsyncThunk(
  'migration/fetchMigration',
  async (id, { rejectWithValue }) => {
    try {
      const response = await migrationService.getMigration(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMigration = createAsyncThunk(
  'migration/createMigration',
  async (data, { rejectWithValue }) => {
    try {
      const response = await migrationService.createMigration(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMigration = createAsyncThunk(
  'migration/updateMigration',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await migrationService.updateMigration(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMigration = createAsyncThunk(
  'migration/deleteMigration',
  async (id, { rejectWithValue }) => {
    try {
      await migrationService.deleteMigration(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyMigration = createAsyncThunk(
  'migration/applyMigration',
  async (id, { rejectWithValue }) => {
    try {
      const response = await migrationService.applyMigration(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const syncTenantMigrations = createAsyncThunk(
  'migration/syncTenantMigrations',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await migrationService.syncMigrations(tenantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const previewMigrationSql = createAsyncThunk(
  'migration/previewMigrationSql',
  async (id, { rejectWithValue }) => {
    try {
      const response = await migrationService.previewSql(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rollbackMigration = createAsyncThunk(
  'migration/rollbackMigration',
  async (id, { rejectWithValue }) => {
    try {
      const response = await migrationService.rollbackMigration(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMigrationStats = createAsyncThunk(
  'migration/fetchMigrationStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await migrationService.getMigrationStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantMigrations = createAsyncThunk(
  'migration/fetchTenantMigrations',
  async ({ tenantId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await migrationService.getTenantMigrations(tenantId, params);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTenantMigrationStats = createAsyncThunk(
  'migration/fetchTenantMigrationStats',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await migrationService.getTenantMigrationStats(tenantId);
      return { tenantId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyTenantMigration = createAsyncThunk(
  'migration/applyTenantMigration',
  async ({ tenantId, migrationId }, { rejectWithValue }) => {
    try {
      const response = await migrationService.applyTenantMigration(tenantId, migrationId);
      return { tenantId, migrationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const migrationSlice = createSlice({
  name: 'migration',
  initialState,
  reducers: {
    clearCurrentMigration: (state) => {
      state.currentMigration = null;
      state.applyResult = null;
      state.sqlPreview = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    clearSqlPreview: (state) => {
      state.sqlPreview = null;
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
    clearStats: (state) => {
      state.stats = null;
    },
    clearTenantMigrations: (state, action) => {
      const { tenantId } = action.payload;
      delete state.tenantMigrations[tenantId];
    },
    clearAllMigrations: (state) => {
      state.migrations = [];
      state.tenantMigrations = {};
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMigrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMigrations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.migrations = Array.isArray(payload) ? payload : (payload?.results || []);
        if (payload?.count) {
          state.pagination.total = payload.count;
          state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
        }
      })
      .addCase(fetchMigrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMigration.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchMigration.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentMigration = action.payload;
      })
      .addCase(fetchMigration.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(createMigration.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createMigration.fulfilled, (state, action) => {
        state.submitting = false;
        state.migrations.unshift(action.payload);
        state.pagination.total += 1;
        if (action.payload.organization_id) {
          const key = action.payload.organization_id;
          if (state.tenantMigrations[key]) {
            state.tenantMigrations[key].unshift(action.payload);
          }
        }
      })
      .addCase(createMigration.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateMigration.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateMigration.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentMigration = action.payload;
        const index = state.migrations.findIndex(m => m.id === action.payload.id);
        if (index !== -1) state.migrations[index] = action.payload;
        Object.keys(state.tenantMigrations).forEach((key) => {
          const idx = state.tenantMigrations[key]?.findIndex(m => m.id === action.payload.id);
          if (idx !== undefined && idx !== -1) {
            state.tenantMigrations[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateMigration.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteMigration.fulfilled, (state, action) => {
        state.migrations = state.migrations.filter(m => m.id !== action.payload);
        state.pagination.total -= 1;
        Object.keys(state.tenantMigrations).forEach((key) => {
          state.tenantMigrations[key] = state.tenantMigrations[key]?.filter(m => m.id !== action.payload) || [];
        });
      })
      .addCase(applyMigration.fulfilled, (state, action) => {
        state.applyResult = action.payload;
        const migration = action.payload.data;
        if (migration) {
          const index = state.migrations.findIndex(m => m.id === migration.id);
          if (index !== -1) state.migrations[index] = migration;
          Object.keys(state.tenantMigrations).forEach((key) => {
            const idx = state.tenantMigrations[key]?.findIndex(m => m.id === migration.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantMigrations[key][idx] = migration;
            }
          });
          if (state.currentMigration?.id === migration.id) {
            state.currentMigration = migration;
          }
        }
      })
      .addCase(fetchMigrationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTenantMigrations.fulfilled, (state, action) => {
        const { tenantId, data } = action.payload;
        state.tenantMigrations[tenantId] = Array.isArray(data) ? data : (data?.results || []);
      })
      .addCase(fetchTenantMigrationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(applyTenantMigration.fulfilled, (state, action) => {
        const { tenantId, migrationId, data } = action.payload;
        const key = tenantId;
        if (state.tenantMigrations[key]) {
          const idx = state.tenantMigrations[key].findIndex(m => m.id === migrationId);
          if (idx !== -1) state.tenantMigrations[key][idx] = data;
        }
        state.applyResult = { tenantId, migrationId, data };
      })
      .addCase(syncTenantMigrations.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncTenantMigrations.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncTenantMigrations.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })
      .addCase(previewMigrationSql.pending, (state) => {
        state.previewing = true;
        state.error = null;
        state.sqlPreview = null;
      })
      .addCase(previewMigrationSql.fulfilled, (state, action) => {
        state.previewing = false;
        state.sqlPreview = action.payload?.sql || action.payload;
      })
      .addCase(previewMigrationSql.rejected, (state, action) => {
        state.previewing = false;
        state.error = action.payload;
      })
      .addCase(rollbackMigration.pending, (state) => {
        state.rollingBack = true;
        state.error = null;
      })
      .addCase(rollbackMigration.fulfilled, (state, action) => {
        state.rollingBack = false;
        const migration = action.payload?.data?.data || action.payload?.data;
        if (migration) {
          const index = state.migrations.findIndex(m => m.id === migration.id);
          if (index !== -1) state.migrations[index] = migration;
          Object.keys(state.tenantMigrations).forEach((key) => {
            const idx = state.tenantMigrations[key]?.findIndex(m => m.id === migration.id);
            if (idx !== undefined && idx !== -1) {
              state.tenantMigrations[key][idx] = migration;
            }
          });
          if (state.currentMigration?.id === migration.id) {
            state.currentMigration = migration;
          }
        }
      })
      .addCase(rollbackMigration.rejected, (state, action) => {
        state.rollingBack = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentMigration,
  clearErrors,
  clearSqlPreview,
  setFilters,
  resetFilters,
  setPagination,
  clearStats,
  clearTenantMigrations,
  clearAllMigrations,
} = migrationSlice.actions;

export default migrationSlice.reducer;
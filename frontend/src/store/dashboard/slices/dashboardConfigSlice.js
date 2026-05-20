import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardConfigService, widgetService, favoriteService } from '../../../services/dashboard';

const initialState = {
  configs: [],
  currentConfig: null,
  widgets: [],
  favorites: [],
  loading: false,
  saving: false,
  error: null,
  lastFetched: null
};

export const fetchDashboardConfigs = createAsyncThunk(
  'dashboardConfig/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.getUserConfigs();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch dashboard configs');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard configs');
    }
  }
);

export const fetchDefaultConfig = createAsyncThunk(
  'dashboardConfig/fetchDefault',
  async (dashboardType, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.getDefaultConfig(dashboardType);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch default config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch default config');
    }
  }
);

export const fetchConfigById = createAsyncThunk(
  'dashboardConfig/fetchById',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.getConfigById(configId);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch config');
    }
  }
);

export const createDashboardConfig = createAsyncThunk(
  'dashboardConfig/create',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.createConfig(configData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create dashboard config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create dashboard config');
    }
  }
);

export const updateDashboardConfig = createAsyncThunk(
  'dashboardConfig/update',
  async ({ configId, configData }, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.updateConfig(configId, configData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update dashboard config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update dashboard config');
    }
  }
);

export const deleteDashboardConfig = createAsyncThunk(
  'dashboardConfig/delete',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.deleteConfig(configId);
      if (response?.success) {
        return configId;
      }
      return rejectWithValue(response?.message || 'Failed to delete dashboard config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete dashboard config');
    }
  }
);

export const cloneDashboardConfig = createAsyncThunk(
  'dashboardConfig/clone',
  async ({ sourceId, newName }, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.cloneConfig(sourceId, newName);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to clone dashboard config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clone dashboard config');
    }
  }
);

export const setDefaultConfig = createAsyncThunk(
  'dashboardConfig/setDefault',
  async (configId, { rejectWithValue }) => {
    try {
      const response = await dashboardConfigService.setDefaultConfig(configId);
      if (response?.success) {
        return { configId, data: response.data };
      }
      return rejectWithValue(response?.message || 'Failed to set default config');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to set default config');
    }
  }
);

export const fetchWidgetsByDashboard = createAsyncThunk(
  'dashboardConfig/fetchWidgets',
  async (dashboardId, { rejectWithValue }) => {
    try {
      const response = await widgetService.getWidgetsByDashboard(dashboardId);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch widgets');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch widgets');
    }
  }
);

export const createWidget = createAsyncThunk(
  'dashboardConfig/createWidget',
  async (widgetData, { rejectWithValue }) => {
    try {
      const response = await widgetService.createWidget(widgetData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to create widget');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create widget');
    }
  }
);

export const updateWidget = createAsyncThunk(
  'dashboardConfig/updateWidget',
  async ({ widgetId, widgetData }, { rejectWithValue }) => {
    try {
      const response = await widgetService.updateWidget(widgetId, widgetData);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to update widget');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update widget');
    }
  }
);

export const deleteWidget = createAsyncThunk(
  'dashboardConfig/deleteWidget',
  async (widgetId, { rejectWithValue }) => {
    try {
      const response = await widgetService.deleteWidget(widgetId);
      if (response?.success) {
        return widgetId;
      }
      return rejectWithValue(response?.message || 'Failed to delete widget');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete widget');
    }
  }
);

export const bulkUpdateWidgetPositions = createAsyncThunk(
  'dashboardConfig/bulkUpdateWidgets',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await widgetService.bulkUpdatePositions(updates);
      if (response?.success) {
        return updates;
      }
      return rejectWithValue(response?.message || 'Failed to update widget positions');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update widget positions');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'dashboardConfig/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavorites();
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to fetch favorites');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch favorites');
    }
  }
);

export const addFavorite = createAsyncThunk(
  'dashboardConfig/addFavorite',
  async ({ kpiId, kpiName, notes }, { rejectWithValue }) => {
    try {
      const response = await favoriteService.addFavorite(kpiId, kpiName, notes);
      if (response?.success) {
        return response.data;
      }
      return rejectWithValue(response?.message || 'Failed to add favorite');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add favorite');
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'dashboardConfig/removeFavorite',
  async (favoriteId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.removeFavorite(favoriteId);
      if (response?.success) {
        return favoriteId;
      }
      return rejectWithValue(response?.message || 'Failed to remove favorite');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove favorite');
    }
  }
);

export const reorderFavorites = createAsyncThunk(
  'dashboardConfig/reorderFavorites',
  async (favoriteIds, { rejectWithValue }) => {
    try {
      const response = await favoriteService.reorderFavorites(favoriteIds);
      if (response?.success) {
        return favoriteIds;
      }
      return rejectWithValue(response?.message || 'Failed to reorder favorites');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reorder favorites');
    }
  }
);

const dashboardConfigSlice = createSlice({
  name: 'dashboardConfig',
  initialState,
  reducers: {
    setCurrentConfig: (state, action) => {
      state.currentConfig = action.payload;
    },
    clearCurrentConfig: (state) => {
      state.currentConfig = null;
      state.widgets = [];
    },
    updateLayout: (state, action) => {
      if (state.currentConfig) {
        state.currentConfig.layout = action.payload;
      }
    },
    updateFilters: (state, action) => {
      if (state.currentConfig) {
        state.currentConfig.default_filters = action.payload;
      }
    },
    clearConfigError: (state) => {
      state.error = null;
    },
    resetConfigState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDashboardConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDefaultConfig.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      })
      .addCase(fetchConfigById.fulfilled, (state, action) => {
        state.currentConfig = action.payload;
      })
      .addCase(createDashboardConfig.fulfilled, (state, action) => {
        state.configs.push(action.payload);
        state.currentConfig = action.payload;
      })
      .addCase(updateDashboardConfig.fulfilled, (state, action) => {
        const index = state.configs.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.configs[index] = action.payload;
        }
        if (state.currentConfig?.id === action.payload.id) {
          state.currentConfig = action.payload;
        }
      })
      .addCase(deleteDashboardConfig.fulfilled, (state, action) => {
        state.configs = state.configs.filter(c => c.id !== action.payload);
        if (state.currentConfig?.id === action.payload) {
          state.currentConfig = null;
          state.widgets = [];
        }
      })
      .addCase(cloneDashboardConfig.fulfilled, (state, action) => {
        state.configs.push(action.payload);
      })
      .addCase(setDefaultConfig.fulfilled, (state, action) => {
        state.configs = state.configs.map(c => ({
          ...c,
          is_default: c.id === action.payload.configId
        }));
        if (state.currentConfig?.id === action.payload.configId) {
          state.currentConfig.is_default = true;
        }
      })
      .addCase(fetchWidgetsByDashboard.fulfilled, (state, action) => {
        state.widgets = action.payload;
      })
      .addCase(createWidget.fulfilled, (state, action) => {
        state.widgets.push(action.payload);
      })
      .addCase(updateWidget.fulfilled, (state, action) => {
        const index = state.widgets.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.widgets[index] = action.payload;
        }
      })
      .addCase(deleteWidget.fulfilled, (state, action) => {
        state.widgets = state.widgets.filter(w => w.id !== action.payload);
      })
      .addCase(bulkUpdateWidgetPositions.fulfilled, (state, action) => {
        action.payload.forEach(update => {
          const widget = state.widgets.find(w => w.id === update.id);
          if (widget) {
            widget.row = update.row;
            widget.col = update.col;
          }
        });
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
      })
      .addCase(reorderFavorites.fulfilled, (state, action) => {
        const reordered = action.payload.map(id => 
          state.favorites.find(f => f.id === id)
        ).filter(Boolean);
        state.favorites = reordered;
      });
  }
});

export const {
  setCurrentConfig,
  clearCurrentConfig,
  updateLayout,
  updateFilters,
  clearConfigError,
  resetConfigState
} = dashboardConfigSlice.actions;

export default dashboardConfigSlice.reducer;
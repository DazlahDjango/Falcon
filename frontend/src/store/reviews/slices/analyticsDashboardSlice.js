// src/store/reviews/slices/analyticsDashboardSlice.js
// Redux slice for analytics dashboard widgets state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsDashboardService } from '@/services/reviews';

// ========== Async Thunks ==========

// Fetch dashboard widgets
export const fetchDashboardWidgets = createAsyncThunk(
    'reviews/analyticsDashboard/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await analyticsDashboardService.getUserAnalyticsDashboard();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard widgets');
        }
    }
);

// Fetch widget data
export const fetchWidgetData = createAsyncThunk(
    'reviews/analyticsDashboard/fetchWidgetData',
    async ({ widgetId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await analyticsDashboardService.getWidgetData(widgetId, params);
            return { widgetId, data: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch widget data');
        }
    }
);

// Refresh widget
export const refreshWidget = createAsyncThunk(
    'reviews/analyticsDashboard/refreshWidget',
    async (widgetId, { rejectWithValue, dispatch }) => {
        try {
            const response = await analyticsDashboardService.refreshWidget(widgetId);
            await dispatch(fetchWidgetData({ widgetId }));
            return { widgetId, data: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to refresh widget');
        }
    }
);

// Add widget
export const addWidget = createAsyncThunk(
    'reviews/analyticsDashboard/addWidget',
    async (widgetData, { rejectWithValue, dispatch }) => {
        try {
            const response = await analyticsDashboardService.create(widgetData);
            await dispatch(fetchDashboardWidgets());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add widget');
        }
    }
);

// Update widget
export const updateWidget = createAsyncThunk(
    'reviews/analyticsDashboard/updateWidget',
    async ({ widgetId, updates }, { rejectWithValue, dispatch }) => {
        try {
            const response = await analyticsDashboardService.update(widgetId, updates);
            await dispatch(fetchDashboardWidgets());
            if (updates.config) {
                await dispatch(fetchWidgetData({ widgetId }));
            }
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update widget');
        }
    }
);

// Remove widget
export const removeWidget = createAsyncThunk(
    'reviews/analyticsDashboard/removeWidget',
    async (widgetId, { rejectWithValue, dispatch }) => {
        try {
            await analyticsDashboardService.delete(widgetId);
            await dispatch(fetchDashboardWidgets());
            return { widgetId };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to remove widget');
        }
    }
);

// Reorder widgets
export const reorderWidgets = createAsyncThunk(
    'reviews/analyticsDashboard/reorderWidgets',
    async (widgetsOrder, { rejectWithValue, dispatch }) => {
        try {
            await analyticsDashboardService.reorderWidgets(widgetsOrder);
            await dispatch(fetchDashboardWidgets());
            return { widgetsOrder };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reorder widgets');
        }
    }
);

// Reset dashboard
export const resetDashboard = createAsyncThunk(
    'reviews/analyticsDashboard/reset',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await analyticsDashboardService.resetAnalyticsDashboard();
            await dispatch(fetchDashboardWidgets());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reset dashboard');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    widgets: [],
    widgetData: {},
    loading: false,
    error: null,
    refreshing: {},
    lastRefreshed: null,
    layoutConfig: {
        cols: 12,
        rowHeight: 100,
        margin: [16, 16],
    },
};

// ========== Slice ==========
const analyticsDashboardSlice = createSlice({
    name: 'reviews/analyticsDashboard',
    initialState,
    reducers: {
        clearDashboardErrors: (state) => {
            state.error = null;
        },
        clearWidgetData: (state, action) => {
            if (action.payload) {
                delete state.widgetData[action.payload];
            } else {
                state.widgetData = {};
            }
        },
        clearAllDashboard: (state) => {
            return initialState;
        },
        setRefreshing: (state, action) => {
            state.refreshing[action.payload] = true;
        },
        clearRefreshing: (state, action) => {
            delete state.refreshing[action.payload];
        },
        updateLayoutConfig: (state, action) => {
            state.layoutConfig = { ...state.layoutConfig, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== Fetch Dashboard ==========
            .addCase(fetchDashboardWidgets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardWidgets.fulfilled, (state, action) => {
                state.loading = false;
                state.widgets = action.payload.results || action.payload;
            })
            .addCase(fetchDashboardWidgets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Fetch Widget Data ==========
            .addCase(fetchWidgetData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWidgetData.fulfilled, (state, action) => {
                state.loading = false;
                state.widgetData[action.payload.widgetId] = action.payload.data;
            })
            .addCase(fetchWidgetData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Refresh Widget ==========
            .addCase(refreshWidget.pending, (state, action) => {
                state.refreshing[action.meta.arg] = true;
            })
            .addCase(refreshWidget.fulfilled, (state, action) => {
                delete state.refreshing[action.payload.widgetId];
                state.lastRefreshed = new Date().toISOString();
            })
            .addCase(refreshWidget.rejected, (state, action) => {
                delete state.refreshing[action.meta.arg];
                state.error = action.payload;
            })
            
            // ========== Add Widget ==========
            .addCase(addWidget.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addWidget.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addWidget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Remove Widget ==========
            .addCase(removeWidget.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeWidget.fulfilled, (state, action) => {
                state.loading = false;
                delete state.widgetData[action.payload.widgetId];
            })
            .addCase(removeWidget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Reorder Widgets ==========
            .addCase(reorderWidgets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reorderWidgets.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(reorderWidgets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Reset Dashboard ==========
            .addCase(resetDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetDashboard.fulfilled, (state) => {
                state.loading = false;
                state.widgetData = {};
            })
            .addCase(resetDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// ========== Actions ==========
export const {
    clearDashboardErrors,
    clearWidgetData,
    clearAllDashboard,
    setRefreshing,
    clearRefreshing,
    updateLayoutConfig,
} = analyticsDashboardSlice.actions;

// ========== Selectors ==========
export const selectDashboardWidgets = (state) => state.reviewsAnalyticsDashboard.widgets;
export const selectWidgetData = (state, widgetId) => state.reviewsAnalyticsDashboard.widgetData[widgetId];
export const selectAllWidgetData = (state) => state.reviewsAnalyticsDashboard.widgetData;
export const selectDashboardLoading = (state) => state.reviewsAnalyticsDashboard.loading;
export const selectDashboardError = (state) => state.reviewsAnalyticsDashboard.error;
export const selectRefreshingWidgets = (state) => state.reviewsAnalyticsDashboard.refreshing;
export const selectIsWidgetRefreshing = (state, widgetId) => 
    !!state.reviewsAnalyticsDashboard.refreshing[widgetId];
export const selectLastRefreshed = (state) => state.reviewsAnalyticsDashboard.lastRefreshed;
export const selectLayoutConfig = (state) => state.reviewsAnalyticsDashboard.layoutConfig;

export default analyticsDashboardSlice.reducer;
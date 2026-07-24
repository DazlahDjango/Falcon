// ============================================
// apps/reportplt/slice/widget.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { widgetService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    widgets: [],
    currentWidget: null,
    widgetData: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { widget_type: null, is_active: null, is_visible: null, dashboard: null },
    types: [],
};

export const fetchWidgets = createAsyncThunk(
    'widget/fetchWidgets',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidgets(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchWidget = createAsyncThunk(
    'widget/fetchWidget',
    async (id, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidget(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createWidget = createAsyncThunk(
    'widget/createWidget',
    async (data, { rejectWithValue }) => {
        try {
            const response = await widgetService.createWidget(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateWidget = createAsyncThunk(
    'widget/updateWidget',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await widgetService.updateWidget(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteWidget = createAsyncThunk(
    'widget/deleteWidget',
    async (id, { rejectWithValue }) => {
        try {
            await widgetService.deleteWidget(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchWidgetData = createAsyncThunk(
    'widget/fetchWidgetData',
    async (id, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidgetData(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const performWidgetAction = createAsyncThunk(
    'widget/performAction',
    async ({ id, action }, { rejectWithValue }) => {
        try {
            const response = await widgetService.performAction(id, action);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const refreshWidget = createAsyncThunk(
    'widget/refreshWidget',
    async (id, { rejectWithValue }) => {
        try {
            const response = await widgetService.refreshWidget(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchWidgetTypes = createAsyncThunk(
    'widget/fetchWidgetTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidgetTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchWidgetsByDashboard = createAsyncThunk(
    'widget/fetchWidgetsByDashboard',
    async (dashboardId, { rejectWithValue }) => {
        try {
            const response = await widgetService.getWidgetsByDashboard(dashboardId);
            return { dashboardId, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        clearCurrentWidget: (state) => {
            state.currentWidget = null;
            state.widgetData = null;
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
        clearAllWidgets: (state) => {
            state.widgets = [];
            state.pagination = initialState.pagination;
        },
        clearWidgetData: (state) => {
            state.widgetData = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWidgets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWidgets.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.widgets = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchWidgets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchWidget.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchWidget.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentWidget = action.payload;
                const index = state.widgets.findIndex(w => w.id === action.payload.id);
                if (index !== -1) state.widgets[index] = action.payload;
            })
            .addCase(fetchWidget.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createWidget.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createWidget.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentWidget = action.payload;
                state.widgets.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createWidget.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateWidget.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateWidget.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentWidget = action.payload;
                const index = state.widgets.findIndex(w => w.id === action.payload.id);
                if (index !== -1) state.widgets[index] = action.payload;
            })
            .addCase(updateWidget.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteWidget.fulfilled, (state, action) => {
                state.widgets = state.widgets.filter(w => w.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(fetchWidgetData.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchWidgetData.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.widgetData = action.payload;
            })
            .addCase(fetchWidgetData.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(performWidgetAction.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.widgets.findIndex(w => w.id === action.payload.id);
                    if (index !== -1) state.widgets[index] = action.payload;
                    if (state.currentWidget?.id === action.payload.id) state.currentWidget = action.payload;
                }
            })
            .addCase(fetchWidgetTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentWidget,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllWidgets,
    clearWidgetData,
} = widgetSlice.actions;

// Aliases for compatibility with useWidgets hook
export const clearWidgetErrors = clearErrors;
export const setWidgetFilters = setFilters;
export const resetWidgetFilters = resetFilters;
export const setWidgetPagination = setPagination;

export default widgetSlice.reducer;
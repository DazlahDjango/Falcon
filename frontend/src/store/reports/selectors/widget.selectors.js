// ============================================
// apps/reportplt/selectors/widget.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

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

export const selectWidgetState = (state) => {
    return state?.widget || state?.reports?.widget || state?.reportplt?.widget || initialState;
};

export const selectWidgets = createSelector(
    [selectWidgetState],
    (state) => state.widgets || []
);

export const selectCurrentWidget = createSelector(
    [selectWidgetState],
    (state) => state.currentWidget || null
);

export const selectWidgetData = createSelector(
    [selectWidgetState],
    (state) => state.widgetData || null
);

export const selectWidgetLoading = createSelector(
    [selectWidgetState],
    (state) => state.loading || false
);

export const selectWidgetDetailsLoading = createSelector(
    [selectWidgetState],
    (state) => state.loadingDetails || false
);

export const selectWidgetSubmitting = createSelector(
    [selectWidgetState],
    (state) => state.submitting || false
);

export const selectWidgetError = createSelector(
    [selectWidgetState],
    (state) => state.error || null
);

export const selectWidgetPagination = createSelector(
    [selectWidgetState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectWidgetPage = createSelector(
    [selectWidgetState],
    (state) => state.pagination?.page || 1
);

export const selectWidgetPageSize = createSelector(
    [selectWidgetState],
    (state) => state.pagination?.pageSize || 20
);

export const selectWidgetTotal = createSelector(
    [selectWidgetState],
    (state) => state.pagination?.total || 0
);

export const selectWidgetTotalPages = createSelector(
    [selectWidgetPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectWidgetFilters = createSelector(
    [selectWidgetState],
    (state) => state.filters || { widget_type: null, is_active: null, is_visible: null, dashboard: null }
);

export const selectWidgetById = createSelector(
    [selectWidgets, (state, id) => id],
    (widgets, id) => widgets.find(w => w.id === id) || null
);

export const selectWidgetsByType = createSelector(
    [selectWidgets, (state, type) => type],
    (widgets, type) => widgets.filter(w => w.widget_type === type)
);

export const selectActiveWidgets = createSelector(
    [selectWidgets],
    (widgets) => widgets.filter(w => w.is_active === true)
);

export const selectVisibleWidgets = createSelector(
    [selectWidgets],
    (widgets) => widgets.filter(w => w.is_visible === true)
);

export const selectWidgetsByDashboard = createSelector(
    [selectWidgets, (state, dashboardId) => dashboardId],
    (widgets, dashboardId) => widgets.filter(w => w.dashboard === dashboardId)
);

export const selectWidgetCount = createSelector(
    [selectWidgets],
    (widgets) => widgets.length
);

export const selectHasWidgets = createSelector(
    [selectWidgets],
    (widgets) => widgets.length > 0
);

export const selectIsWidgetLoading = createSelector(
    [selectWidgetLoading],
    (loading) => loading
);

export const selectHasWidgetError = createSelector(
    [selectWidgetError],
    (error) => error !== null
);

export const selectWidgetTypes = createSelector(
    [selectWidgetState],
    (state) => state.types || []
);
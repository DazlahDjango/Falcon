// ============================================
// apps/reportplt/selectors/dashboard.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    dashboards: [],
    currentDashboard: null,
    myDashboards: [],
    defaultDashboard: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { dashboard_type: null, is_default: null, is_shared: null, is_published: null, search: '' },
    types: [],
    layout: null,
};

export const selectDashboardState = (state) => {
    return state?.dashboard || state?.reports?.dashboard || state?.reportplt?.dashboard || initialState;
};

export const selectDashboards = createSelector(
    [selectDashboardState],
    (state) => state.dashboards || []
);

export const selectCurrentDashboard = createSelector(
    [selectDashboardState],
    (state) => state.currentDashboard || null
);

export const selectMyDashboards = createSelector(
    [selectDashboardState],
    (state) => state.myDashboards || []
);

export const selectDefaultDashboard = createSelector(
    [selectDashboardState],
    (state) => state.defaultDashboard || null
);

export const selectDashboardLoading = createSelector(
    [selectDashboardState],
    (state) => state.loading || false
);

export const selectDashboardDetailsLoading = createSelector(
    [selectDashboardState],
    (state) => state.loadingDetails || false
);

export const selectDashboardSubmitting = createSelector(
    [selectDashboardState],
    (state) => state.submitting || false
);

export const selectDashboardError = createSelector(
    [selectDashboardState],
    (state) => state.error || null
);

export const selectDashboardPagination = createSelector(
    [selectDashboardState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectDashboardPage = createSelector(
    [selectDashboardState],
    (state) => state.pagination?.page || 1
);

export const selectDashboardPageSize = createSelector(
    [selectDashboardState],
    (state) => state.pagination?.pageSize || 20
);

export const selectDashboardTotal = createSelector(
    [selectDashboardState],
    (state) => state.pagination?.total || 0
);

export const selectDashboardTotalPages = createSelector(
    [selectDashboardPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectDashboardFilters = createSelector(
    [selectDashboardState],
    (state) => state.filters || { dashboard_type: null, is_default: null, is_shared: null, is_published: null, search: '' }
);

export const selectDashboardById = createSelector(
    [selectDashboards, (state, id) => id],
    (dashboards, id) => dashboards.find(d => d.id === id) || null
);

export const selectDashboardsByType = createSelector(
    [selectDashboards, (state, type) => type],
    (dashboards, type) => dashboards.filter(d => d.dashboard_type === type)
);

export const selectSharedDashboards = createSelector(
    [selectDashboards],
    (dashboards) => dashboards.filter(d => d.is_shared === true)
);

export const selectPublishedDashboards = createSelector(
    [selectDashboards],
    (dashboards) => dashboards.filter(d => d.is_published === true)
);

export const selectDefaultDashboardsList = createSelector(
    [selectDashboards],
    (dashboards) => dashboards.filter(d => d.is_default === true)
);

export const selectDashboardCount = createSelector(
    [selectDashboards],
    (dashboards) => dashboards.length
);

export const selectHasDashboards = createSelector(
    [selectDashboards],
    (dashboards) => dashboards.length > 0
);

export const selectIsDashboardLoading = createSelector(
    [selectDashboardLoading],
    (loading) => loading
);

export const selectHasDashboardError = createSelector(
    [selectDashboardError],
    (error) => error !== null
);

export const selectDashboardTypes = createSelector(
    [selectDashboardState],
    (state) => state.types || []
);

export const selectDashboardLayout = createSelector(
    [selectDashboardState],
    (state) => state.layout || null
);
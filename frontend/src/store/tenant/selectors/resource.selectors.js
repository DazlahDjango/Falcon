import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  resources: [],
  currentResource: null,
  tenantResources: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  resetResult: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { organization_id: null, resource_type: null, is_exceeded: null, is_warning: null },
  resourceUsage: null,
  summary: [],
  analytics: {},
  exceededList: [],
  syncResult: null,
};

export const selectResourceState = (state) => {
    return state?.resource || state?.tenant?.resource || initialState;
};

export const selectResources = createSelector(
  [selectResourceState],
  (state) => state.resources || []
);

export const selectCurrentResource = createSelector(
  [selectResourceState],
  (state) => state.currentResource || null
);

export const selectResourceLoading = createSelector(
  [selectResourceState],
  (state) => state.loading || false
);

export const selectResourceDetailsLoading = createSelector(
  [selectResourceState],
  (state) => state.loadingDetails || false
);

export const selectResourceSubmitting = createSelector(
  [selectResourceState],
  (state) => state.submitting || false
);

export const selectResourceError = createSelector(
  [selectResourceState],
  (state) => state.error || null
);

export const selectResourcePagination = createSelector(
  [selectResourceState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectResourcePage = createSelector(
  [selectResourceState],
  (state) => state.pagination?.page || 1
);

export const selectResourceTotal = createSelector(
  [selectResourceState],
  (state) => state.pagination?.total || 0
);

export const selectResourceTotalPages = createSelector(
  [selectResourcePagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectResourceFilters = createSelector(
  [selectResourceState],
  (state) => state.filters || { organization_id: null, resource_type: null, is_exceeded: null, is_warning: null }
);

export const selectResetResult = createSelector(
  [selectResourceState],
  (state) => state.resetResult || null
);

export const selectResourceUsage = createSelector(
  [selectResourceState],
  (state) => state.resourceUsage || null
);

export const selectTenantResources = createSelector(
  [selectResourceState, (state, tenantId) => tenantId],
  (state, tenantId) => state.tenantResources?.[tenantId] || []
);

export const selectResourceById = createSelector(
  [selectResources, (state, id) => id],
  (resources, id) => resources.find(r => r.id === id) || null
);

export const selectResourcesByType = createSelector(
  [selectResources, (state, type) => type],
  (resources, type) => resources.filter(r => r.resource_type === type)
);

export const selectResourcesByOrganization = createSelector(
  [selectResources, (state, orgId) => orgId],
  (resources, orgId) => resources.filter(r => r.organization_id === orgId)
);

export const selectExceededResources = createSelector(
  [selectResources],
  (resources) => resources.filter(r => r.is_exceeded === true)
);

export const selectWarningResources = createSelector(
  [selectResources],
  (resources) => resources.filter(r => r.is_warning === true)
);

export const selectHealthyResources = createSelector(
  [selectResources],
  (resources) => resources.filter(r => r.is_exceeded !== true && r.is_warning !== true)
);

export const selectResourceUsageByOrganization = createSelector(
  [selectTenantResources],
  (resources) => {
    const usage = {};
    resources.forEach(r => {
      usage[r.resource_type] = {
        current: r.current_value,
        limit: r.limit_value,
        percentage: r.percentage_used || 0,
        exceeded: r.is_exceeded || false,
        warning: r.is_warning || false,
      };
    });
    return usage;
  }
);

export const selectResourceCount = createSelector(
  [selectResources],
  (resources) => resources.length
);

export const selectExceededResourceCount = createSelector(
  [selectExceededResources],
  (exceeded) => exceeded.length
);

export const selectWarningResourceCount = createSelector(
  [selectWarningResources],
  (warning) => warning.length
);

export const selectHasResources = createSelector(
  [selectResources],
  (resources) => resources.length > 0
);

export const selectHasTenantResources = createSelector(
  [selectTenantResources],
  (resources) => resources.length > 0
);

export const selectResourceUsagePercentage = createSelector(
  [selectResourceById],
  (resource) => resource?.percentage_used || 0
);

export const selectResourceIsExceeded = createSelector(
  [selectResourceById],
  (resource) => resource?.is_exceeded || false
);

export const selectResourceIsWarning = createSelector(
  [selectResourceById],
  (resource) => resource?.is_warning || false
);

// ─── Enterprise Selectors ───────────────────────────────────────────────────

export const selectResourceSummary = createSelector(
  [selectResourceState],
  (state) => state.summary || []
);

export const selectResourceAnalytics = createSelector(
  [selectResourceState],
  (state) => state.analytics || {}
);

export const selectResourceAnalyticsByType = createSelector(
  [selectResourceAnalytics, (state, resourceType) => resourceType],
  (analytics, resourceType) => analytics[resourceType] || null
);

export const selectExceededResourcesList = createSelector(
  [selectResourceState],
  (state) => state.exceededList || []
);

export const selectSyncResult = createSelector(
  [selectResourceState],
  (state) => state.syncResult || null
);

export const selectResourceBurstAllowed = createSelector(
  [selectResourceById],
  (resource) => resource?.burst_allowed || false
);

export const selectResourceSoftLimit = createSelector(
  [selectResourceById],
  (resource) => resource?.soft_limit || null
);

export const selectResourceHardLimit = createSelector(
  [selectResourceById],
  (resource) => resource?.hard_limit || null
);

export const selectResourceSummaryByType = createSelector(
  [selectResourceSummary, (state, resourceType) => resourceType],
  (summary, resourceType) =>
    Array.isArray(summary)
      ? summary.find(s => s.resource_type === resourceType) || null
      : null
);

export const selectOverallHealthStatus = createSelector(
  [selectResources],
  (resources) => {
    const total = resources.length;
    if (total === 0) return 'no_data';
    const exceededCount = resources.filter(r => r.is_exceeded).length;
    const warningCount = resources.filter(r => r.is_warning && !r.is_exceeded).length;
    if (exceededCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  }
);
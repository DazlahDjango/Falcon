// frontend/src/store/tenant/selectors/provision.selectors.js
import { createSelector } from '@reduxjs/toolkit';

// ============================================
// BASE STATE
// ============================================

const initialState = {
    list: [],
    failed: [],
    inProgress: [],
    current: null,
    pagination: { count: 0, failedCount: 0, inProgressCount: 0 },
    filters: { status: null, ordering: '-created_at' },
    loading: false,
    actionLoading: false,
    error: null,
    actionError: null,
    lastTriggered: null,
    lastRetried: null,
    lastRolledBack: null,
};

// Root state accessor — handles both direct and nested (tenant.provisioning) access
export const selectProvisionState = (state) =>
    state?.provisioning ||
    state?.tenant?.provisioning ||
    initialState;

// ============================================
// LISTS
// ============================================

export const selectProvisioningList = createSelector(
    [selectProvisionState],
    (state) => state.list || []
);

export const selectFailedProvisionings = createSelector(
    [selectProvisionState],
    (state) => state.failed || []
);

export const selectInProgressProvisionings = createSelector(
    [selectProvisionState],
    (state) => state.inProgress || []
);

// ============================================
// CURRENT ORG DETAIL
// ============================================

export const selectCurrentProvisioningStatus = createSelector(
    [selectProvisionState],
    (state) => state.current || null
);

export const selectCurrentProvisioningSteps = createSelector(
    [selectCurrentProvisioningStatus],
    (current) => current?.steps || {}
);

export const selectCurrentProvisioningMeta = createSelector(
  [selectCurrentProvisioningStatus],
  (current) => current?.provisioning || current?.metadata?.provisioning || null
);

export const selectCurrentProvisioningProgress = createSelector(
  [selectCurrentProvisioningMeta],
  (meta) => meta?.progress ?? 0
);

export const selectCurrentProvisioningCurrentStep = createSelector(
  [selectCurrentProvisioningMeta],
  (meta) => meta?.step_name || meta?.current_step || null
);

// ============================================
// PAGINATION
// ============================================

export const selectProvisioningPagination = createSelector(
    [selectProvisionState],
    (state) => state.pagination || { count: 0, failedCount: 0, inProgressCount: 0 }
);

export const selectProvisioningTotalCount = createSelector(
    [selectProvisioningPagination],
    (pagination) => pagination.count || 0
);

export const selectFailedCount = createSelector(
    [selectProvisioningPagination],
    (pagination) => pagination.failedCount || 0
);

export const selectInProgressCount = createSelector(
    [selectProvisioningPagination],
    (pagination) => pagination.inProgressCount || 0
);

// ============================================
// FILTERS
// ============================================

export const selectProvisioningFilters = createSelector(
    [selectProvisionState],
    (state) => state.filters || { status: null, ordering: '-created_at' }
);

// ============================================
// LOADING / ERROR
// ============================================

export const selectProvisioningLoading = createSelector(
    [selectProvisionState],
    (state) => state.loading || false
);

export const selectProvisioningActionLoading = createSelector(
    [selectProvisionState],
    (state) => state.actionLoading || false
);

export const selectProvisioningError = createSelector(
    [selectProvisionState],
    (state) => state.error || null
);

export const selectProvisioningActionError = createSelector(
    [selectProvisionState],
    (state) => state.actionError || null
);

// ============================================
// LAST ACTIONS
// ============================================

export const selectLastTriggered = createSelector(
    [selectProvisionState],
    (state) => state.lastTriggered || null
);

export const selectLastRetried = createSelector(
    [selectProvisionState],
    (state) => state.lastRetried || null
);

export const selectLastRolledBack = createSelector(
    [selectProvisionState],
    (state) => state.lastRolledBack || null
);

// ============================================
// DERIVED / COMPUTED
// ============================================

export const selectHasFailedProvisionings = createSelector(
    [selectFailedProvisionings],
    (failed) => failed.length > 0
);

export const selectHasInProgressProvisionings = createSelector(
    [selectInProgressProvisionings],
    (inProgress) => inProgress.length > 0
);

export const selectProvisioningById = createSelector(
    [selectProvisioningList, (state, orgId) => orgId],
    (list, orgId) => list.find((org) => org.id === orgId) || null
);

export const selectIsCurrentOrgProvisioning = createSelector(
  [selectCurrentProvisioningStatus],
  (current) => current?.status === 'PROVISIONING'
);

export const selectIsCurrentOrgProvisioned = createSelector(
    [selectCurrentProvisioningStatus],
    (current) => current?.status === 'ACTIVE' && current?.is_onboarded
);

export const selectIsCurrentOrgFailed = createSelector(
    [selectCurrentProvisioningStatus],
    (current) => current?.status === 'FAILED'
);

export const selectProvisioningHealthSummary = createSelector(
    [selectProvisioningTotalCount, selectFailedCount, selectInProgressCount],
    (total, failed, inProgress) => ({
        total,
        failed,
        inProgress,
        active: total - failed - inProgress,
        healthPercentage: total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
    })
);

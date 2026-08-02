// ============================================
// apps/reportplt/selectors/share.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    shares: [],
    currentShare: null,
    sharedWithMe: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { share_type: null, permission: null, is_active: null, report: null },
    types: [],
    permissions: [],
    accessToken: null,
};

export const selectShareState = (state) => {
    return state?.report?.share || state?.reports?.share || state?.reportplt?.share || state?.share || initialState;
};

export const selectShares = createSelector(
    [selectShareState],
    (state) => state.shares || []
);

export const selectCurrentShare = createSelector(
    [selectShareState],
    (state) => state.currentShare || null
);

export const selectSharedWithMe = createSelector(
    [selectShareState],
    (state) => state.sharedWithMe || []
);

export const selectShareLoading = createSelector(
    [selectShareState],
    (state) => state.loading || false
);

export const selectShareDetailsLoading = createSelector(
    [selectShareState],
    (state) => state.loadingDetails || false
);

export const selectShareSubmitting = createSelector(
    [selectShareState],
    (state) => state.submitting || false
);

export const selectShareError = createSelector(
    [selectShareState],
    (state) => state.error || null
);

export const selectSharePagination = createSelector(
    [selectShareState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectSharePage = createSelector(
    [selectShareState],
    (state) => state.pagination?.page || 1
);

export const selectSharePageSize = createSelector(
    [selectShareState],
    (state) => state.pagination?.pageSize || 20
);

export const selectShareTotal = createSelector(
    [selectShareState],
    (state) => state.pagination?.total || 0
);

export const selectShareTotalPages = createSelector(
    [selectSharePagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectShareFilters = createSelector(
    [selectShareState],
    (state) => state.filters || { share_type: null, permission: null, is_active: null, report: null }
);

export const selectShareById = createSelector(
    [selectShares, (state, id) => id],
    (shares, id) => shares.find(s => s.id === id) || null
);

export const selectSharesByType = createSelector(
    [selectShares, (state, type) => type],
    (shares, type) => shares.filter(s => s.share_type === type)
);

export const selectSharesByPermission = createSelector(
    [selectShares, (state, permission) => permission],
    (shares, permission) => shares.filter(s => s.permission === permission)
);

export const selectActiveShares = createSelector(
    [selectShares],
    (shares) => shares.filter(s => s.is_active === true)
);

export const selectShareCount = createSelector(
    [selectShares],
    (shares) => shares.length
);

export const selectHasShares = createSelector(
    [selectShares],
    (shares) => shares.length > 0
);

export const selectIsShareLoading = createSelector(
    [selectShareLoading],
    (loading) => loading
);

export const selectHasShareError = createSelector(
    [selectShareError],
    (error) => error !== null
);

export const selectShareTypes = createSelector(
    [selectShareState],
    (state) => state.types || []
);

export const selectSharePermissions = createSelector(
    [selectShareState],
    (state) => state.permissions || []
);

export const selectShareAccessToken = createSelector(
    [selectShareState],
    (state) => state.accessToken || null
);
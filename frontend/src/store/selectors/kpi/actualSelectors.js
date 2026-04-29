import { createSelector } from '@reduxjs/toolkit';

const selectActualState = (state) => state.actual;
const selectActualListState = (state) => state.actual.list;
const selectActualDetailState = (state) => state.actual.detail;
const selectEvidenceState = (state) => state.actual.evidence;
const selectAdjustmentsState = (state) => state.actual.adjustments;
// List selectors
export const selectActuals = createSelector(
    [selectActualListState],
    (list) => list.items
);
export const selectActualsLoading = createSelector(
    [selectActualListState],
    (list) => list.loading
);
export const selectActualsError = createSelector(
    [selectActualListState],
    (list) => list.error
);
export const selectActualsPagination = createSelector(
    [selectActualListState],
    (list) => list.pagination
);
export const selectActualFilters = createSelector(
    [selectActualListState],
    (list) => list.filters
);
// Detail selectors
export const selectCurrentActual = createSelector(
    [selectActualDetailState],
    (detail) => detail.item
);
export const selectActualDetailLoading = createSelector(
    [selectActualDetailState],
    (detail) => detail.loading
);
// Evidence selectors
export const selectEvidence = createSelector(
    [selectEvidenceState],
    (evidence) => evidence.items
);
export const selectEvidenceLoading = createSelector(
    [selectEvidenceState],
    (evidence) => evidence.loading
);
// Adjustments selectors
export const selectAdjustments = createSelector(
    [selectAdjustmentsState],
    (adjustments) => adjustments.items
);
export const selectAdjustmentsLoading = createSelector(
    [selectAdjustmentsState],
    (adjustments) => adjustments.loading
);
// Computed selectors
export const selectActualsByPeriod = (year, month) => createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.year === year && a.month === month)
);
export const selectActualsByKPI = (kpiId) => createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.kpiId === kpiId)
);
export const selectActualsByUser = (userId) => createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.userId === userId)
);
export const selectPendingActuals = createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.status === 'PENDING')
);
export const selectApprovedActuals = createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.status === 'APPROVED')
);
export const selectRejectedActuals = createSelector(
    [selectActuals],
    (actuals) => actuals.filter(a => a.status === 'REJECTED')
);
export const selectSubmissionRate = createSelector(
    [selectActuals],
    (actuals) => {
        const total = actuals.length;
        const submitted = actuals.filter(a => a.status !== 'DRAFT').length;
        return total > 0 ? (submitted / total) * 100 : 0;
    }
);
export const selectValidationRate = createSelector(
    [selectActuals],
    (actuals) => {
        const submitted = actuals.filter(a => a.status !== 'DRAFT').length;
        const validated = actuals.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length;
        return submitted > 0 ? (validated / submitted) * 100 : 0;
    }
);
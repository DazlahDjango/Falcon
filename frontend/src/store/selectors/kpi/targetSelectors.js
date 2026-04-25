import { createSelector } from "@reduxjs/toolkit";

const selectTargetState = (state) => state.target;
const selectTargetListState = (state) => state.target.list;
const selectTargetDetailState = (state) => state.target.detail;
const selectTargetPhasingState = (state) => state.target.phasing;
const selectTargetCascadeState = (state) => state.target.cascade;
// List selectors
export const selectTargets = createSelector(
    [selectTargetListState],
    (list) => list.items
);
export const selectTargetsLoading = createSelector(
    [selectTargetListState],
    (list) => list.loading
);
export const selectTargetsError = createSelector(
    [selectTargetListState],
    (list) => list.error
);
export const selectTargetsPagination = createSelector(
    [selectTargetListState],
    (list) => list.pagination
);
export const selectTargetFilters = createSelector(
    [selectTargetListState],
    (list) => list.filters
);
// Detail selectors
export const selectCurrentTarget = createSelector(
    [selectTargetDetailState],
    (detail) => detail.item
);
export const selectTargetDetailLoading = createSelector(
    [selectTargetDetailState],
    (detail) => detail.loading
);
// Phasing selectors
export const selectPhasing = createSelector(
    [selectTargetPhasingState],
    (phasing) => phasing.items
);
export const selectPhasingLoading = createSelector(
    [selectTargetPhasingState],
    (phasing) => phasing.loading
);
export const selectIsPhasingLocked = createSelector(
    [selectTargetPhasingState],
    (phasing) => phasing.isLocked
);
// Cascade selectors
export const selectCascadeMaps = createSelector(
    [selectTargetCascadeState],
    (cascade) => cascade.maps
);
export const selectCascadeRules = createSelector(
    [selectTargetCascadeState],
    (cascade) => cascade.rules
);
export const selectCascadeTree = createSelector(
    [selectTargetCascadeState],
    (cascade) => cascade.tree
);
export const selectCascadeLoading = createSelector(
    [selectTargetCascadeState],
    (cascade) => cascade.loading
);
// Computed selectors
export const selectTargetsByYear = (year) => createSelector(
    [selectTargets],
    (targets) => targets.filter(t => t.year === year)
);
export const selectTargetsByKPI = (kpiId) => createSelector(
    [selectTargets],
    (targets) => targets.filter(t => t.kpiId === kpiId)
);
export const selectTargetsByUser = (userId) => createSelector(
    [selectTargets],
    (targets) => targets.filter(t => t.userId === userId)
);
export const selectCurrentTargetPhasing = createSelector(
    [selectCurrentTarget, selectPhasing],
    (target, phasing) => {
        if (!target) return [];
        return phasing.filter(p => p.annualTargetId === target.id);
    }
);
export const selectPhasingTotal = createSelector(
    [selectCurrentTargetPhasing],
    (phasing) => phasing.reduce((sum, p) => sum + p.targetValue, 0)
);
export const selectPhasingDistribution = createSelector(
    [selectCurrentTargetPhasing],
    (phasing) => {
        if (!phasing.length) return [];
        const sorted = [...phasing].sort((a, b) => a.month - b.month);
        return sorted.map(p => ({
            month: p.month,
            value: p.targetValue,
            percentage: (p.targetValue / sorted.reduce((s, p2) => s + p2.targetValue, 0)) * 100
        }));
    }
);
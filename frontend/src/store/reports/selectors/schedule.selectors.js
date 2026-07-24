// ============================================
// apps/reportplt/selectors/schedule.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    schedules: [],
    currentSchedule: null,
    dueSchedules: [],
    overdueSchedules: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { frequency: null, status: null, is_active: null, search: '' },
    frequencies: [],
    history: [],
    upcomingRuns: [],
};

export const selectScheduleState = (state) => {
    return state?.schedule || state?.reports?.schedule || state?.reportplt?.schedule || initialState;
};

export const selectSchedules = createSelector(
    [selectScheduleState],
    (state) => state.schedules || []
);

export const selectCurrentSchedule = createSelector(
    [selectScheduleState],
    (state) => state.currentSchedule || null
);

export const selectDueSchedules = createSelector(
    [selectScheduleState],
    (state) => state.dueSchedules || []
);

export const selectOverdueSchedules = createSelector(
    [selectScheduleState],
    (state) => state.overdueSchedules || []
);

export const selectScheduleLoading = createSelector(
    [selectScheduleState],
    (state) => state.loading || false
);

export const selectScheduleDetailsLoading = createSelector(
    [selectScheduleState],
    (state) => state.loadingDetails || false
);

export const selectScheduleSubmitting = createSelector(
    [selectScheduleState],
    (state) => state.submitting || false
);

export const selectScheduleError = createSelector(
    [selectScheduleState],
    (state) => state.error || null
);

export const selectSchedulePagination = createSelector(
    [selectScheduleState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectSchedulePage = createSelector(
    [selectScheduleState],
    (state) => state.pagination?.page || 1
);

export const selectSchedulePageSize = createSelector(
    [selectScheduleState],
    (state) => state.pagination?.pageSize || 20
);

export const selectScheduleTotal = createSelector(
    [selectScheduleState],
    (state) => state.pagination?.total || 0
);

export const selectScheduleTotalPages = createSelector(
    [selectSchedulePagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectScheduleFilters = createSelector(
    [selectScheduleState],
    (state) => state.filters || { frequency: null, status: null, is_active: null, search: '' }
);

export const selectScheduleById = createSelector(
    [selectSchedules, (state, id) => id],
    (schedules, id) => schedules.find(s => s.id === id) || null
);

export const selectSchedulesByFrequency = createSelector(
    [selectSchedules, (state, frequency) => frequency],
    (schedules, frequency) => schedules.filter(s => s.frequency === frequency)
);

export const selectSchedulesByStatus = createSelector(
    [selectSchedules, (state, status) => status],
    (schedules, status) => schedules.filter(s => s.status === status)
);

export const selectActiveSchedules = createSelector(
    [selectSchedules],
    (schedules) => schedules.filter(s => s.is_active === true)
);

export const selectPausedSchedules = createSelector(
    [selectSchedules],
    (schedules) => schedules.filter(s => s.is_paused === true)
);

export const selectScheduleCount = createSelector(
    [selectSchedules],
    (schedules) => schedules.length
);

export const selectHasSchedules = createSelector(
    [selectSchedules],
    (schedules) => schedules.length > 0
);

export const selectIsScheduleLoading = createSelector(
    [selectScheduleLoading],
    (loading) => loading
);

export const selectHasScheduleError = createSelector(
    [selectScheduleError],
    (error) => error !== null
);

export const selectScheduleFrequencies = createSelector(
    [selectScheduleState],
    (state) => state.frequencies || []
);

export const selectScheduleHistory = createSelector(
    [selectScheduleState],
    (state) => state.history || []
);

export const selectUpcomingRuns = createSelector(
    [selectScheduleState],
    (state) => state.upcomingRuns || []
);
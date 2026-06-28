// src/store/reviews/selectors/cycle.selectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base Selectors
export const selectCyclesState = (state) => state.reviews.cycles;
export const selectAllCycles = (state) => selectCyclesState(state).items;
export const selectCycleById = (state, id) =>
  selectAllCycles(state).find((item) => item.id === id);
export const selectSelectedCycle = (state) => selectCyclesState(state).selectedItem;
export const selectCyclesLoading = (state) => selectCyclesState(state).loading;
export const selectCyclesError = (state) => selectCyclesState(state).error;
export const selectCyclesPagination = (state) => selectCyclesState(state).pagination;
export const selectCyclesFilters = (state) => selectCyclesState(state).filters;
export const selectActiveCycle = (state) => selectCyclesState(state).activeCycle;
export const selectCycleProgress = (state) => selectCyclesState(state).progress;
export const selectCycleParticipants = (state) => selectCyclesState(state).participants;
export const selectCycleSummary = (state) => selectCyclesState(state).summary;

// Memoized Selectors
export const selectActiveCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'active' || item.status === 'submitted')
);

export const selectCompletedCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'completed')
);

export const selectArchivedCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'archived')
);

export const selectUpcomingCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'draft' || item.status === 'upcoming')
);

export const selectCyclesByType = createSelector(
  [selectAllCycles, (state, type) => type],
  (cycles, type) => cycles.filter((item) => item.cycle_type === type)
);

export const selectCyclesByYear = createSelector(
  [selectAllCycles, (state, year) => year],
  (cycles, year) => cycles.filter((item) => new Date(item.start_date).getFullYear() === year)
);
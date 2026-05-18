export const selectSchedules = (state) => state.configSchedule?.schedules || [];
export const selectCurrentSchedule = (state) => state.configSchedule?.currentSchedule;
export const selectScheduleStats = (state) => state.configSchedule?.stats || {};
export const selectScheduleFilters = (state) => state.configSchedule?.filters || {};
export const selectSchedulePagination = (state) => state.configSchedule?.pagination || {};
export const selectScheduleLoading = (state) => state.configSchedule?.loading || false;
export const selectScheduleError = (state) => state.configSchedule?.error;
export const selectActiveSchedules = (state) => selectSchedules(state).filter(s => s.status === 'active');
export const selectSchedulesByType = (state, scheduleType) => selectSchedules(state).filter(s => s.schedule_type === scheduleType);
export const selectFailedSchedules = (state) => selectSchedules(state).filter(s => s.failure_count >= s.max_consecutive_failures);
export const selectNextDueSchedule = (state) => {
  const active = selectActiveSchedules(state);
  return active.sort((a, b) => new Date(a.next_run_at) - new Date(b.next_run_at))[0];
};
export const selectBackupJobs = (state) => state.configBackup?.jobs || [];
export const selectCurrentBackupJob = (state) => state.configBackup?.currentJob;
export const selectBackupPolicies = (state) => state.configBackup?.policies || [];
export const selectBackupArtifacts = (state) => state.configBackup?.artifacts || [];
export const selectBackupStats = (state) => state.configBackup?.stats || {};
export const selectBackupFilters = (state) => state.configBackup?.filters || {};
export const selectBackupPagination = (state) => state.configBackup?.pagination || {};
export const selectBackupLoading = (state) => state.configBackup?.loading || false;
export const selectBackupError = (state) => state.configBackup?.error;
export const selectBackupWSConnected = (state) => state.configBackup?.wsConnected || false;
export const selectActiveBackupProgress = (state) => state.configBackup?.activeBackupProgress;

export const selectBackupJobsByStatus = (state, status) => selectBackupJobs(state).filter(job => job.status === status);
export const selectBackupJobsByApp = (state, appName) => selectBackupJobs(state).filter(job => job.app_name === appName);
export const selectRecentBackups = (state, limit = 10) => selectBackupJobs(state).slice(0, limit);
export const selectSuccessfulBackupRate = (state) => {
  const jobs = selectBackupJobs(state);
  const completed = jobs.filter(j => j.status === 'completed').length;
  const total = jobs.length;
  return total > 0 ? (completed / total) * 100 : 0;
};
export const selectTotalBackupSize = (state) => selectBackupJobs(state).reduce((sum, job) => sum + (job.size_bytes || 0), 0);
import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  migrations: [],
  currentMigration: null,
  tenantMigrations: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  stats: null,
  applyResult: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { organization_id: null, app_name: null, status: null },
};

export const selectMigrationState = (state) => {
    return state?.migration || state?.tenant?.migration || initialState;
};

export const selectMigrations = createSelector(
  [selectMigrationState],
  (state) => state.migrations || []
);

export const selectCurrentMigration = createSelector(
  [selectMigrationState],
  (state) => state.currentMigration || null
);

export const selectMigrationLoading = createSelector(
  [selectMigrationState],
  (state) => state.loading || false
);

export const selectMigrationDetailsLoading = createSelector(
  [selectMigrationState],
  (state) => state.loadingDetails || false
);

export const selectMigrationSubmitting = createSelector(
  [selectMigrationState],
  (state) => state.submitting || false
);

export const selectMigrationError = createSelector(
  [selectMigrationState],
  (state) => state.error || null
);

export const selectMigrationPagination = createSelector(
  [selectMigrationState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectMigrationPage = createSelector(
  [selectMigrationState],
  (state) => state.pagination?.page || 1
);

export const selectMigrationTotal = createSelector(
  [selectMigrationState],
  (state) => state.pagination?.total || 0
);

export const selectMigrationTotalPages = createSelector(
  [selectMigrationPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectMigrationFilters = createSelector(
  [selectMigrationState],
  (state) => state.filters || { organization_id: null, app_name: null, status: null }
);

export const selectMigrationStats = createSelector(
  [selectMigrationState],
  (state) => state.stats || null
);

export const selectApplyResult = createSelector(
  [selectMigrationState],
  (state) => state.applyResult || null
);

export const selectMigrationSyncing = createSelector(
  [selectMigrationState],
  (state) => state.syncing || false
);

export const selectMigrationPreviewing = createSelector(
  [selectMigrationState],
  (state) => state.previewing || false
);

export const selectMigrationRollingBack = createSelector(
  [selectMigrationState],
  (state) => state.rollingBack || false
);

export const selectSqlPreview = createSelector(
  [selectMigrationState],
  (state) => state.sqlPreview || null
);

export const selectTenantMigrations = createSelector(
  [selectMigrationState, (state, tenantId) => tenantId],
  (state, tenantId) => state.tenantMigrations?.[tenantId] || []
);

export const selectMigrationById = createSelector(
  [selectMigrations, (state, id) => id],
  (migrations, id) => migrations.find(m => m.id === id) || null
);

export const selectPendingMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.filter(m => m.status === 'PENDING')
);

export const selectRunningMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.filter(m => m.status === 'RUNNING')
);

export const selectCompletedMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.filter(m => m.status === 'COMPLETED')
);

export const selectFailedMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.filter(m => m.status === 'FAILED')
);

export const selectRolledBackMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.filter(m => m.status === 'ROLLED_BACK')
);

export const selectMigrationsByApp = createSelector(
  [selectMigrations, (state, appName) => appName],
  (migrations, appName) => migrations.filter(m => m.app_name === appName)
);

export const selectMigrationsByOrganization = createSelector(
  [selectMigrations, (state, orgId) => orgId],
  (migrations, orgId) => migrations.filter(m => m.organization_id === orgId)
);

export const selectMigrationCount = createSelector(
  [selectMigrations],
  (migrations) => migrations.length
);

export const selectPendingMigrationCount = createSelector(
  [selectPendingMigrations],
  (pending) => pending.length
);

export const selectFailedMigrationCount = createSelector(
  [selectFailedMigrations],
  (failed) => failed.length
);

export const selectCompletedMigrationCount = createSelector(
  [selectCompletedMigrations],
  (completed) => completed.length
);

export const selectMigrationStatsSummary = createSelector(
  [selectMigrationStats],
  (stats) => {
    if (!stats) return null;
    return {
      total: stats.total || 0,
      pending: stats.pending || 0,
      running: stats.running || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      rolledBack: stats.rolled_back || 0,
      avgExecutionTime: stats.avg_execution_time_ms || 0,
    };
  }
);

export const selectHasMigrations = createSelector(
  [selectMigrations],
  (migrations) => migrations.length > 0
);

export const selectHasTenantMigrations = createSelector(
  [selectTenantMigrations],
  (migrations) => migrations.length > 0
);

export const selectLastMigration = createSelector(
  [selectMigrations],
  (migrations) => migrations.length > 0 ? migrations[0] : null
);
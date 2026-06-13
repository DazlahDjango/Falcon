const WS_HOST = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
const WS_BASE = WS_HOST.replace(/\/ws\/?$/, '');

const buildPath = (path) => `/ws/${path.replace(/^\/+/, '')}`;

export const websocketHost = WS_HOST;
export const websocketBase = WS_BASE;

export const ACCOUNT_WS = {
  AUTH: buildPath('auth/'),
  NOTIFICATIONS: buildPath('notifications/'),
  NOTIFICATIONS_USER: (userId) => buildPath(`notifications/${userId}/`),
  PRESENCE: buildPath('presence/'),
  PRESENCE_TENANT: (tenantId) => buildPath(`presence/${tenantId}/`),
};

export const BILLING_WS = {
  TENANT: (tenantId) => buildPath(`billing/${tenantId}/`),
  ADMIN: buildPath('admin/billing/'),
};

export const TENANT_WS = {
  STATUS: (tenantId) => buildPath(`tenant/${tenantId}/status/`),
  PROVISIONING: (taskId) => buildPath(`tenant/provisioning/${taskId}/`),
  BACKUP_PROGRESS: (backupId) => buildPath(`tenant/backup/${backupId}/progress/`),
};

export const STRUCTURE_WS = {
  EVENTS: (tenantId) => buildPath(`structure/${tenantId}/events/`),
  REPORTING: (tenantId) => buildPath(`structure/${tenantId}/reporting/`),
  PERMISSIONS: (tenantId) => buildPath(`structure/${tenantId}/permissions/`),
  DEPARTMENT: (tenantId, departmentId) => buildPath(`structure/${tenantId}/departments/${departmentId}/`),
  TEAM: (tenantId, teamId) => buildPath(`structure/${tenantId}/teams/${teamId}/`),
};

export const DASHBOARD_WS = {
  DASHBOARD: (dashboardType) => buildPath(`dashboard/${dashboardType}/`),
  NOTIFICATIONS: buildPath('notifications/'),
};

export const CONFIG_WS_PATHS = {
  MAINTENANCE_STATUS: (tenantId) => buildPath(`config/maintenance/${tenantId}/`),
  BACKUP_PROGRESS: (backupJobId) => buildPath(`config/backup/${backupJobId}/`),
  DR_PROGRESS: (executionId) => buildPath(`config/dr/${executionId}/`),
};

export const REVIEWS_WS = {
  STATUS: (cycleId) => buildPath(`reviews/status/${cycleId}/`),
  CALIBRATION: (sessionId) => buildPath(`reviews/calibration/${sessionId}/`),
  NOTIFICATIONS: buildPath('reviews/notifications/'),
  DASHBOARD: buildPath('reviews/dashboard/'),
};

export const KPI_WS = {
  DASHBOARD: (userId) => `kpi/dashboard/${userId}/`,
  TEAM: (managerId) => `kpi/team/${managerId}/`,
  EXECUTIVE: (tenantId) => `kpi/executive/${tenantId}/`,
  NOTIFICATIONS: (userId) => `kpi/notifications/${userId}/`,
  SCORES: (userId) => `kpi/scores/${userId}/`,
  VALIDATION: (userId) => `kpi/validation/${userId}/`,
  REPORTS: (reportId) => `kpi/reports/${reportId}/`,
  ANALYTICS: (tenantId) => `kpi/analytics/${tenantId}/`,
  ALERTS: (tenantId) => `kpi/alerts/${tenantId}/`,
  ADMIN: `kpi/admin/`,
};

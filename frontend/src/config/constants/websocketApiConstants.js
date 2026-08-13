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
  STATUS: (orgId) => buildPath(`organizations/${orgId}/status/`),
  PROVISIONING: (orgId) => buildPath(`organizations/${orgId}/provisioning/`),
  DOMAIN_VERIFICATION: (orgId) => buildPath(`organizations/${orgId}/domain-verification/`),
  QUOTA: (orgId) => buildPath(`organizations/${orgId}/quota/`),
  MIGRATIONS: (orgId) => buildPath(`organizations/${orgId}/migrations/`),
  CONNECTION_EVENTS: buildPath('connections/'),
  SYSTEM_ALERTS: buildPath('system/alerts/'),
  BACKUP_PROGRESS: (backupId) => buildPath(`tenant/backup/${backupId}/progress/`),
};

export const STRUCTURE_WS = {
  EVENTS: (tenantId) => buildPath(`structure/${tenantId}/events/`),
  REPORTING: (tenantId) => buildPath(`structure/${tenantId}/reporting/`),
  PERMISSIONS: (tenantId) => buildPath(`structure/${tenantId}/permissions/`),
  DIVISION: (tenantId, divisionId) => buildPath(`structure/${tenantId}/divisions/${divisionId}/`),
  DEPARTMENT: (tenantId, departmentId) => buildPath(`structure/${tenantId}/departments/${departmentId}/`),
  SECTION: (tenantId, sectionId) => buildPath(`structure/${tenantId}/sections/${sectionId}/`),
  UNIT: (tenantId, unitId) => buildPath(`structure/${tenantId}/units/${unitId}/`),
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
  DASHBOARD: (userId) => buildPath(`kpi/dashboard/${userId}/`),
  TEAM: (managerId) => buildPath(`kpi/team/${managerId}/`),
  EXECUTIVE: (tenantId) => buildPath(`kpi/executive/${tenantId}/`),
  NOTIFICATIONS: (userId) => buildPath(`kpi/notifications/${userId}/`),
  SCORES: (userId) => buildPath(`kpi/scores/${userId}/`),
  VALIDATION: (userId) => buildPath(`kpi/validation/${userId}/`),
  REPORTS: (reportId) => buildPath(`kpi/reports/${reportId}/`),
  ANALYTICS: (tenantId) => buildPath(`kpi/analytics/${tenantId}/`),
  ALERTS: (tenantId) => buildPath(`kpi/alerts/${tenantId}/`),
  ADMIN: buildPath('kpi/admin/monitor/'),
};

export const REPORTPLT_WS = {
  DASHBOARD: (dashboardId) => buildPath(`dashboard/${dashboardId}/`),
  REPORT_STATUS: (reportId) => buildPath(`report/${reportId}/status/`),
  NOTIFICATIONS: buildPath('notifications/'),
};

export const REPORT_WS = REPORTPLT_WS;

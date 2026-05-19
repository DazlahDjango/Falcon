const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const CONFIG_API = {
    BASE: `${API_BASE}/config`,
    
    // App Registry
    REGISTERED_APPS: `${API_BASE}/config/registered-apps`,
    APP_DEPENDENCIES: `${API_BASE}/config/app-dependencies`,
    REGISTER_V1_APPS: `${API_BASE}/config/registered-apps/register_v1_apps`,
    RECOVERY_SEQUENCE: `${API_BASE}/config/registered-apps/recovery_sequence`,
    PRIORITY_ORDER: `${API_BASE}/config/registered-apps/priority_order`,
    
    // Backup
    BACKUP_POLICIES: `${API_BASE}/config/backup-policies`,
    BACKUP_JOBS: `${API_BASE}/config/backup-jobs`,
    BACKUP_ARTIFACTS: `${API_BASE}/config/backup-artifacts`,
    TRIGGER_BACKUP: `${API_BASE}/config/backup-jobs/trigger`,
    CANCEL_BACKUP: (id) => `${API_BASE}/config/backup-jobs/${id}/cancel`,
    RESTORE_BACKUP: (id) => `${API_BASE}/config/backup-jobs/${id}/restore`,
    VERIFY_BACKUP: (id) => `${API_BASE}/config/backup-jobs/${id}/verify`,
    APPLY_RETENTION: `${API_BASE}/config/backup-jobs/apply_retention`,
    DELETE_ARTIFACT: (id) => `${API_BASE}/config/backup-artifacts/${id}/delete_artifact`,
    
    // Maintenance
    MAINTENANCE_WINDOWS: `${API_BASE}/config/maintenance-windows`,
    MAINTENANCE_LOGS: `${API_BASE}/config/maintenance-logs`,
    START_MAINTENANCE: (id) => `${API_BASE}/config/maintenance-windows/${id}/start`,
    STOP_MAINTENANCE: (id) => `${API_BASE}/config/maintenance-windows/${id}/stop`,
    CANCEL_MAINTENANCE: (id) => `${API_BASE}/config/maintenance-windows/${id}/cancel`,
    RISK_ASSESSMENT: `${API_BASE}/config/maintenance-windows/risk_assessment`,
    
    // Disaster Recovery
    DR_PLANS: `${API_BASE}/config/dr-plans`,
    DR_EXECUTIONS: `${API_BASE}/config/dr-executions`,
    EXECUTE_DR_PLAN: (id) => `${API_BASE}/config/dr-plans/${id}/execute`,
    DR_DRILL: (id) => `${API_BASE}/config/dr-plans/${id}/drill`,
    DR_METRICS: `${API_BASE}/config/dr-plans/metrics`,
    FAILOVER: (id) => `${API_BASE}/config/dr-executions/${id}/failover`,
    FAILBACK: (id) => `${API_BASE}/config/dr-executions/${id}/failback`,
    
    // Health
    HEALTH_CHECKS: `${API_BASE}/config/health-checks`,
    HEALTH_HISTORY: `${API_BASE}/config/health-history`,
    CHECK_ALL_HEALTH: `${API_BASE}/config/health-checks/check_all`,
    LATEST_HEALTH: `${API_BASE}/config/health-checks/latest`,
    HEALTH_METRICS: `${API_BASE}/config/health-checks/metrics`,
    EVALUATE_THRESHOLDS: `${API_BASE}/config/health-checks/evaluate_thresholds`,
    CONDITIONAL_TRIGGER: `${API_BASE}/config/health-checks/conditional_trigger`,
    
    // Schedules
    SCHEDULES: `${API_BASE}/config/schedules`,
    EXECUTE_DUE_SCHEDULES: `${API_BASE}/config/schedules/execute_due`,
    EVALUATE_CRON: `${API_BASE}/config/schedules/evaluate_expressions`,
    
    // Quotas
    QUOTAS: `${API_BASE}/config/quotas`,
    UPDATE_QUOTA: (id) => `${API_BASE}/config/quotas/${id}/update_quota`,
    OVER_THRESHOLD: `${API_BASE}/config/quotas/over_threshold`,
    EXCEEDED_QUOTAS: `${API_BASE}/config/quotas/exceeded`,
    
    // Encryption
    ENCRYPTION_KEYS: `${API_BASE}/config/encryption-keys`,
    ROTATE_KEY: `${API_BASE}/config/encryption-keys/rotate`,
    REVOKE_KEY: (id) => `${API_BASE}/config/encryption-keys/${id}/revoke`,
    DEFAULT_KEY: `${API_BASE}/config/encryption-keys/default`,
    KEYS_NEEDING_ROTATION: `${API_BASE}/config/encryption-keys/needs_rotation`,
    
    // Audit
    AUDIT_LOGS: `${API_BASE}/config/audit-logs`,
    
    // Dashboard
    DASHBOARD_OVERVIEW: `${API_BASE}/config/dashboard/overview`,
    DASHBOARD_BACKUP: `${API_BASE}/config/dashboard/backup`,
    DASHBOARD_MAINTENANCE: `${API_BASE}/config/dashboard/maintenance`,
    DASHBOARD_HEALTH: `${API_BASE}/config/dashboard/health`,
    DASHBOARD_DR: `${API_BASE}/config/dashboard/dr`,
    DASHBOARD_SCHEDULING: `${API_BASE}/config/dashboard/scheduling`,
    DASHBOARD_SECURITY: `${API_BASE}/config/dashboard/security`,
    DASHBOARD_RECENT: `${API_BASE}/config/dashboard/recent`,
    DASHBOARD_STATUS: `${API_BASE}/config/dashboard/status`,
};

export const CONFIG_WS = {
    MAINTENANCE_STATUS: (tenantId) => `${WS_BASE}/config/maintenance/${tenantId}`,
    BACKUP_PROGRESS: (backupJobId) => `${WS_BASE}/config/backup/${backupJobId}`,
    DR_PROGRESS: (executionId) => `${WS_BASE}/config/dr/${executionId}`,
};

export const CONFIG_QUERY_KEYS = {
    // App Registry
    REGISTERED_APPS: 'registered-apps',
    APP_DEPENDENCIES: 'app-dependencies',
    RECOVERY_SEQUENCE: 'recovery-sequence',
    PRIORITY_ORDER: 'priority-order',
    
    // Backup
    BACKUP_POLICIES: 'backup-policies',
    BACKUP_JOBS: 'backup-jobs',
    BACKUP_JOB: 'backup-job',
    BACKUP_ARTIFACTS: 'backup-artifacts',
    BACKUP_ARTIFACT: 'backup-artifact',
    
    // Maintenance
    MAINTENANCE_WINDOWS: 'maintenance-windows',
    MAINTENANCE_WINDOW: 'maintenance-window',
    MAINTENANCE_LOGS: 'maintenance-logs',
    
    // DR
    DR_PLANS: 'dr-plans',
    DR_PLAN: 'dr-plan',
    DR_EXECUTIONS: 'dr-executions',
    DR_METRICS: 'dr-metrics',
    
    // Health
    HEALTH_CHECKS: 'health-checks',
    HEALTH_HISTORY: 'health-history',
    HEALTH_METRICS: 'health-metrics',
    
    // Schedules
    SCHEDULES: 'schedules',
    SCHEDULE: 'schedule',
    
    // Quotas
    QUOTAS: 'quotas',
    QUOTA: 'quota',
    
    // Encryption
    ENCRYPTION_KEYS: 'encryption-keys',
    ENCRYPTION_KEY: 'encryption-key',
    
    // Audit
    AUDIT_LOGS: 'audit-logs',
    
    // Dashboard
    DASHBOARD_OVERVIEW: 'dashboard-overview',
    DASHBOARD_BACKUP: 'dashboard-backup',
    DASHBOARD_MAINTENANCE: 'dashboard-maintenance',
    DASHBOARD_HEALTH: 'dashboard-health',
    DASHBOARD_DR: 'dashboard-dr',
    DASHBOARD_SCHEDULING: 'dashboard-scheduling',
    DASHBOARD_SECURITY: 'dashboard-security',
    DASHBOARD_RECENT: 'dashboard-recent',
    DASHBOARD_STATUS: 'dashboard-status',
};

export const CONFIG_MUTATION_KEYS = {
    TRIGGER_BACKUP: 'trigger-backup',
    CANCEL_BACKUP: 'cancel-backup',
    RESTORE_BACKUP: 'restore-backup',
    VERIFY_BACKUP: 'verify-backup',
    APPLY_RETENTION: 'apply-retention',
    
    CREATE_MAINTENANCE: 'create-maintenance',
    START_MAINTENANCE: 'start-maintenance',
    STOP_MAINTENANCE: 'stop-maintenance',
    CANCEL_MAINTENANCE: 'cancel-maintenance',
    
    EXECUTE_DR: 'execute-dr',
    RUN_DR_DRILL: 'run-dr-drill',
    FAILOVER: 'failover',
    FAILBACK: 'failback',
    
    CREATE_SCHEDULE: 'create-schedule',
    UPDATE_SCHEDULE: 'update-schedule',
    DELETE_SCHEDULE: 'delete-schedule',
    
    UPDATE_QUOTA: 'update-quota',
    
    ROTATE_KEY: 'rotate-key',
    REVOKE_KEY: 'revoke-key',
    
    REGISTER_V1_APPS: 'register-v1-apps',
    CREATE_DEPENDENCY: 'create-dependency',
    DELETE_DEPENDENCY: 'delete-dependency',
};
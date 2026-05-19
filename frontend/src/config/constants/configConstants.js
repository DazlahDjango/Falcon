export const MAINTENANCE_TYPES = {
    FULL: 'full',
    PARTIAL: 'partial',
    ROLLING: 'rolling',
    EMERGENCY: 'emergency',
};

export const MAINTENANCE_TYPE_LABELS = {
    [MAINTENANCE_TYPES.FULL]: 'Full Maintenance',
    [MAINTENANCE_TYPES.PARTIAL]: 'Partial Maintenance',
    [MAINTENANCE_TYPES.ROLLING]: 'Rolling Maintenance',
    [MAINTENANCE_TYPES.EMERGENCY]: 'Emergency Maintenance',
};

export const MAINTENANCE_STATUS = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
};

export const MAINTENANCE_STATUS_LABELS = {
    [MAINTENANCE_STATUS.SCHEDULED]: 'Scheduled',
    [MAINTENANCE_STATUS.IN_PROGRESS]: 'In Progress',
    [MAINTENANCE_STATUS.COMPLETED]: 'Completed',
    [MAINTENANCE_STATUS.CANCELLED]: 'Cancelled',
    [MAINTENANCE_STATUS.FAILED]: 'Failed',
};

export const MAINTENANCE_STATUS_COLORS = {
    [MAINTENANCE_STATUS.SCHEDULED]: 'blue',
    [MAINTENANCE_STATUS.IN_PROGRESS]: 'orange',
    [MAINTENANCE_STATUS.COMPLETED]: 'green',
    [MAINTENANCE_STATUS.CANCELLED]: 'gray',
    [MAINTENANCE_STATUS.FAILED]: 'red',
};

export const BACKUP_TYPES = {
    FULL: 'full',
    INCREMENTAL: 'incremental',
    DIFFERENTIAL: 'differential',
    SYNTHETIC: 'synthetic',
    CDP: 'cdp',
};

export const BACKUP_TYPE_LABELS = {
    [BACKUP_TYPES.FULL]: 'Full Backup',
    [BACKUP_TYPES.INCREMENTAL]: 'Incremental Backup',
    [BACKUP_TYPES.DIFFERENTIAL]: 'Differential Backup',
    [BACKUP_TYPES.SYNTHETIC]: 'Synthetic Full Backup',
    [BACKUP_TYPES.CDP]: 'Continuous Data Protection',
};

export const BACKUP_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PARTIAL: 'partial',
    VERIFYING: 'verifying',
};

export const BACKUP_STATUS_LABELS = {
    [BACKUP_STATUS.PENDING]: 'Pending',
    [BACKUP_STATUS.RUNNING]: 'Running',
    [BACKUP_STATUS.COMPLETED]: 'Completed',
    [BACKUP_STATUS.FAILED]: 'Failed',
    [BACKUP_STATUS.CANCELLED]: 'Cancelled',
    [BACKUP_STATUS.PARTIAL]: 'Partial Success',
    [BACKUP_STATUS.VERIFYING]: 'Verifying Integrity',
};

export const BACKUP_STATUS_COLORS = {
    [BACKUP_STATUS.PENDING]: 'yellow',
    [BACKUP_STATUS.RUNNING]: 'blue',
    [BACKUP_STATUS.COMPLETED]: 'green',
    [BACKUP_STATUS.FAILED]: 'red',
    [BACKUP_STATUS.CANCELLED]: 'gray',
    [BACKUP_STATUS.PARTIAL]: 'orange',
    [BACKUP_STATUS.VERIFYING]: 'purple',
};

export const BACKUP_STORAGE_LOCATIONS = {
    S3: 's3',
    GCS: 'gcs',
    AZURE: 'azure',
    LOCAL: 'local',
    NFS: 'nfs',
    TAPE: 'tape',
};

export const BACKUP_STORAGE_LABELS = {
    [BACKUP_STORAGE_LOCATIONS.S3]: 'AWS S3',
    [BACKUP_STORAGE_LOCATIONS.GCS]: 'Google Cloud Storage',
    [BACKUP_STORAGE_LOCATIONS.AZURE]: 'Azure Blob',
    [BACKUP_STORAGE_LOCATIONS.LOCAL]: 'Local Filesystem',
    [BACKUP_STORAGE_LOCATIONS.NFS]: 'Network File System',
    [BACKUP_STORAGE_LOCATIONS.TAPE]: 'Tape Archive',
};

export const BACKUP_ARTIFACT_STATUS = {
    UPLOADED: 'uploaded',
    VERIFYING: 'verifying',
    VERIFIED: 'verified',
    CORRUPT: 'corrupt',
    DELETED: 'deleted',
    ARCHIVED: 'archived',
};

export const BACKUP_ARTIFACT_STATUS_LABELS = {
    [BACKUP_ARTIFACT_STATUS.UPLOADED]: 'Uploaded',
    [BACKUP_ARTIFACT_STATUS.VERIFYING]: 'Verifying',
    [BACKUP_ARTIFACT_STATUS.VERIFIED]: 'Verified',
    [BACKUP_ARTIFACT_STATUS.CORRUPT]: 'Corrupt',
    [BACKUP_ARTIFACT_STATUS.DELETED]: 'Deleted',
    [BACKUP_ARTIFACT_STATUS.ARCHIVED]: 'Archived',
};

export const BACKUP_ARTIFACT_STATUS_COLORS = {
    [BACKUP_ARTIFACT_STATUS.UPLOADED]: 'blue',
    [BACKUP_ARTIFACT_STATUS.VERIFYING]: 'purple',
    [BACKUP_ARTIFACT_STATUS.VERIFIED]: 'green',
    [BACKUP_ARTIFACT_STATUS.CORRUPT]: 'red',
    [BACKUP_ARTIFACT_STATUS.DELETED]: 'gray',
    [BACKUP_ARTIFACT_STATUS.ARCHIVED]: 'orange',
};

export const COMPRESSION_ALGORITHMS = {
    ZSTD: 'zstd',
    GZIP: 'gzip',
    LZ4: 'lz4',
};

export const COMPRESSION_ALGORITHM_LABELS = {
    [COMPRESSION_ALGORITHMS.ZSTD]: 'Zstandard',
    [COMPRESSION_ALGORITHMS.GZIP]: 'Gzip',
    [COMPRESSION_ALGORITHMS.LZ4]: 'LZ4',
};

export const STORAGE_CLASSES = {
    STANDARD: 'standard',
    INTELLIGENT: 'intelligent',
    GLACIER: 'glacier',
    DEEP_ARCHIVE: 'deep_archive',
};

export const STORAGE_CLASS_LABELS = {
    [STORAGE_CLASSES.STANDARD]: 'Standard - Frequent Access',
    [STORAGE_CLASSES.INTELLIGENT]: 'Intelligent-Tiering',
    [STORAGE_CLASSES.GLACIER]: 'Glacier - Long-term Archive',
    [STORAGE_CLASSES.DEEP_ARCHIVE]: 'Deep Archive - 10+ Years',
};

export const DR_EXECUTION_TYPES = {
    DRILL: 'drill',
    ACTUAL: 'actual',
    FAILOVER: 'failover',
    FAILBACK: 'failback',
};

export const DR_EXECUTION_TYPE_LABELS = {
    [DR_EXECUTION_TYPES.DRILL]: 'Drill/Test',
    [DR_EXECUTION_TYPES.ACTUAL]: 'Actual Disaster Recovery',
    [DR_EXECUTION_TYPES.FAILOVER]: 'Failover to Standby',
    [DR_EXECUTION_TYPES.FAILBACK]: 'Failback to Primary',
};

export const DR_STATUS = {
    INITIATED: 'initiated',
    IN_PROGRESS: 'in_progress',
    VALIDATING: 'validating',
    SUCCESS: 'success',
    PARTIAL: 'partial',
    FAILED: 'failed',
    ABORTED: 'aborted',
};

export const DR_STATUS_LABELS = {
    [DR_STATUS.INITIATED]: 'Initiated',
    [DR_STATUS.IN_PROGRESS]: 'In Progress',
    [DR_STATUS.VALIDATING]: 'Validating Recovery',
    [DR_STATUS.SUCCESS]: 'Success',
    [DR_STATUS.PARTIAL]: 'Partial Success',
    [DR_STATUS.FAILED]: 'Failed',
    [DR_STATUS.ABORTED]: 'Aborted',
};

export const DR_STATUS_COLORS = {
    [DR_STATUS.INITIATED]: 'gray',
    [DR_STATUS.IN_PROGRESS]: 'blue',
    [DR_STATUS.VALIDATING]: 'purple',
    [DR_STATUS.SUCCESS]: 'green',
    [DR_STATUS.PARTIAL]: 'orange',
    [DR_STATUS.FAILED]: 'red',
    [DR_STATUS.ABORTED]: 'red',
};

export const HEALTH_STATUS = {
    HEALTHY: 'healthy',
    DEGRADED: 'degraded',
    UNHEALTHY: 'unhealthy',
    UNKNOWN: 'unknown',
    MAINTENANCE: 'maintenance',
};

export const HEALTH_STATUS_LABELS = {
    [HEALTH_STATUS.HEALTHY]: 'Healthy',
    [HEALTH_STATUS.DEGRADED]: 'Degraded',
    [HEALTH_STATUS.UNHEALTHY]: 'Unhealthy',
    [HEALTH_STATUS.UNKNOWN]: 'Unknown',
    [HEALTH_STATUS.MAINTENANCE]: 'Maintenance Mode',
};

export const HEALTH_STATUS_COLORS = {
    [HEALTH_STATUS.HEALTHY]: 'green',
    [HEALTH_STATUS.DEGRADED]: 'yellow',
    [HEALTH_STATUS.UNHEALTHY]: 'red',
    [HEALTH_STATUS.UNKNOWN]: 'gray',
    [HEALTH_STATUS.MAINTENANCE]: 'orange',
};

export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
};

export const RISK_LEVEL_LABELS = {
    [RISK_LEVELS.LOW]: 'Low Risk',
    [RISK_LEVELS.MEDIUM]: 'Medium Risk',
    [RISK_LEVELS.HIGH]: 'High Risk',
    [RISK_LEVELS.CRITICAL]: 'Critical Risk',
};

export const RISK_LEVEL_COLORS = {
    [RISK_LEVELS.LOW]: 'green',
    [RISK_LEVELS.MEDIUM]: 'yellow',
    [RISK_LEVELS.HIGH]: 'orange',
    [RISK_LEVELS.CRITICAL]: 'red',
};

export const SCHEDULE_TYPES = {
    BACKUP: 'backup',
    MAINTENANCE: 'maintenance',
    HEALTH_CHECK: 'health_check',
    DR_DRILL: 'dr_drill',
};

export const SCHEDULE_TYPE_LABELS = {
    [SCHEDULE_TYPES.BACKUP]: 'Backup Schedule',
    [SCHEDULE_TYPES.MAINTENANCE]: 'Maintenance Schedule',
    [SCHEDULE_TYPES.HEALTH_CHECK]: 'Health Check Schedule',
    [SCHEDULE_TYPES.DR_DRILL]: 'DR Drill Schedule',
};

export const SCHEDULE_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired',
    DELETED: 'deleted',
};

export const SCHEDULE_STATUS_LABELS = {
    [SCHEDULE_STATUS.ACTIVE]: 'Active',
    [SCHEDULE_STATUS.PAUSED]: 'Paused',
    [SCHEDULE_STATUS.EXPIRED]: 'Expired',
    [SCHEDULE_STATUS.DELETED]: 'Deleted',
};

export const SCHEDULE_STATUS_COLORS = {
    [SCHEDULE_STATUS.ACTIVE]: 'green',
    [SCHEDULE_STATUS.PAUSED]: 'yellow',
    [SCHEDULE_STATUS.EXPIRED]: 'gray',
    [SCHEDULE_STATUS.DELETED]: 'red',
};

export const ENCRYPTION_KEY_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    COMPROMISED: 'compromised',
    EXPIRED: 'expired',
    DELETED: 'deleted',
};

export const ENCRYPTION_KEY_STATUS_LABELS = {
    [ENCRYPTION_KEY_STATUS.ACTIVE]: 'Active',
    [ENCRYPTION_KEY_STATUS.INACTIVE]: 'Inactive',
    [ENCRYPTION_KEY_STATUS.COMPROMISED]: 'Compromised',
    [ENCRYPTION_KEY_STATUS.EXPIRED]: 'Expired',
    [ENCRYPTION_KEY_STATUS.DELETED]: 'Deleted',
};

export const ENCRYPTION_KEY_STATUS_COLORS = {
    [ENCRYPTION_KEY_STATUS.ACTIVE]: 'green',
    [ENCRYPTION_KEY_STATUS.INACTIVE]: 'gray',
    [ENCRYPTION_KEY_STATUS.COMPROMISED]: 'red',
    [ENCRYPTION_KEY_STATUS.EXPIRED]: 'orange',
    [ENCRYPTION_KEY_STATUS.DELETED]: 'gray',
};

export const ENCRYPTION_KEY_SOURCES = {
    AWS_KMS: 'aws_kms',
    GCP_KMS: 'gcp_kms',
    AZURE_KEYVAULT: 'azure_keyvault',
    HASHICORP_VAULT: 'hashicorp_vault',
    LOCAL_HSM: 'local_hsm',
};

export const ENCRYPTION_KEY_SOURCE_LABELS = {
    [ENCRYPTION_KEY_SOURCES.AWS_KMS]: 'AWS KMS',
    [ENCRYPTION_KEY_SOURCES.GCP_KMS]: 'Google Cloud KMS',
    [ENCRYPTION_KEY_SOURCES.AZURE_KEYVAULT]: 'Azure Key Vault',
    [ENCRYPTION_KEY_SOURCES.HASHICORP_VAULT]: 'HashiCorp Vault',
    [ENCRYPTION_KEY_SOURCES.LOCAL_HSM]: 'Local HSM',
};

export const AUDIT_ACTIONS = {
    REGISTER_APP: 'register_app',
    UNREGISTER_APP: 'unregister_app',
    TRIGGER_BACKUP: 'trigger_backup',
    CANCEL_BACKUP: 'cancel_backup',
    RESTORE_BACKUP: 'restore_backup',
    DELETE_BACKUP: 'delete_backup',
    VERIFY_BACKUP: 'verify_backup',
    CREATE_MAINTENANCE: 'create_maintenance',
    START_MAINTENANCE: 'start_maintenance',
    STOP_MAINTENANCE: 'stop_maintenance',
    CANCEL_MAINTENANCE: 'cancel_maintenance',
    EXTEND_MAINTENANCE: 'extend_maintenance',
    EXECUTE_DR: 'execute_dr',
    RUN_DR_DRILL: 'run_dr_drill',
    FAILOVER: 'failover',
    FAILBACK: 'failback',
    UPDATE_POLICY: 'update_policy',
    ROTATE_KEY: 'rotate_key',
    CHANGE_QUOTA: 'change_quota',
    DELETE_ARTIFACT: 'delete_artifact',
    SCHEDULE_CREATE: 'schedule_create',
    SCHEDULE_UPDATE: 'schedule_update',
    SCHEDULE_DELETE: 'schedule_delete',
    SYSTEM_ACTION: 'system_action',
};

export const AUDIT_ACTION_LABELS = {
    [AUDIT_ACTIONS.REGISTER_APP]: 'Registered App',
    [AUDIT_ACTIONS.UNREGISTER_APP]: 'Unregistered App',
    [AUDIT_ACTIONS.TRIGGER_BACKUP]: 'Triggered Backup',
    [AUDIT_ACTIONS.CANCEL_BACKUP]: 'Cancelled Backup',
    [AUDIT_ACTIONS.RESTORE_BACKUP]: 'Restored from Backup',
    [AUDIT_ACTIONS.DELETE_BACKUP]: 'Deleted Backup',
    [AUDIT_ACTIONS.VERIFY_BACKUP]: 'Verified Backup Integrity',
    [AUDIT_ACTIONS.CREATE_MAINTENANCE]: 'Created Maintenance Window',
    [AUDIT_ACTIONS.START_MAINTENANCE]: 'Started Maintenance',
    [AUDIT_ACTIONS.STOP_MAINTENANCE]: 'Stopped Maintenance',
    [AUDIT_ACTIONS.CANCEL_MAINTENANCE]: 'Cancelled Maintenance',
    [AUDIT_ACTIONS.EXTEND_MAINTENANCE]: 'Extended Maintenance',
    [AUDIT_ACTIONS.EXECUTE_DR]: 'Executed DR Plan',
    [AUDIT_ACTIONS.RUN_DR_DRILL]: 'Ran DR Drill',
    [AUDIT_ACTIONS.FAILOVER]: 'Performed Failover',
    [AUDIT_ACTIONS.FAILBACK]: 'Performed Failback',
    [AUDIT_ACTIONS.UPDATE_POLICY]: 'Updated Backup Policy',
    [AUDIT_ACTIONS.ROTATE_KEY]: 'Rotated Encryption Key',
    [AUDIT_ACTIONS.CHANGE_QUOTA]: 'Changed Backup Quota',
    [AUDIT_ACTIONS.DELETE_ARTIFACT]: 'Deleted Backup Artifact',
    [AUDIT_ACTIONS.SCHEDULE_CREATE]: 'Created Schedule',
    [AUDIT_ACTIONS.SCHEDULE_UPDATE]: 'Updated Schedule',
    [AUDIT_ACTIONS.SCHEDULE_DELETE]: 'Deleted Schedule',
    [AUDIT_ACTIONS.SYSTEM_ACTION]: 'System Automated Action',
};

export const AUDIT_RESULTS = {
    SUCCESS: 'success',
    FAILURE: 'failure',
    PARTIAL: 'partial',
    PENDING: 'pending',
};

export const AUDIT_RESULT_LABELS = {
    [AUDIT_RESULTS.SUCCESS]: 'Success',
    [AUDIT_RESULTS.FAILURE]: 'Failure',
    [AUDIT_RESULTS.PARTIAL]: 'Partial Success',
    [AUDIT_RESULTS.PENDING]: 'Pending',
};

export const AUDIT_RESULT_COLORS = {
    [AUDIT_RESULTS.SUCCESS]: 'green',
    [AUDIT_RESULTS.FAILURE]: 'red',
    [AUDIT_RESULTS.PARTIAL]: 'orange',
    [AUDIT_RESULTS.PENDING]: 'yellow',
};

export const DEPENDENCY_TYPES = {
    HARD: 'hard',
    SOFT: 'soft',
    OPTIONAL: 'optional',
};

export const DEPENDENCY_TYPE_LABELS = {
    [DEPENDENCY_TYPES.HARD]: 'Hard Dependency',
    [DEPENDENCY_TYPES.SOFT]: 'Soft Dependency',
    [DEPENDENCY_TYPES.OPTIONAL]: 'Optional',
};

export const RECOVERY_PRIORITIES = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
};

export const RECOVERY_PRIORITY_LABELS = {
    [RECOVERY_PRIORITIES.CRITICAL]: 'Critical - RTO < 1hr',
    [RECOVERY_PRIORITIES.HIGH]: 'High - RTO < 4hr',
    [RECOVERY_PRIORITIES.MEDIUM]: 'Medium - RTO < 24hr',
    [RECOVERY_PRIORITIES.LOW]: 'Low - RTO < 72hr',
};

export const QUOTA_WARNING_THRESHOLDS = {
    WARNING: 80,
    CRITICAL: 95,
};

export const DEFAULT_PAGE_SIZE = parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20;
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880;
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
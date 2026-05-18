from django.db import models

class BackupType:
    FULL = 'full'
    INCREMENTAL = 'incremental'
    DIFFERENTIAL = 'differential'
    SYNTHETIC = 'synthetic'
    CDP = 'cdp'
    CHOICES = [
        (FULL, 'Full Backup'),
        (INCREMENTAL, 'Incremental Backup'),
        (DIFFERENTIAL, 'Differential Backup'),
        (SYNTHETIC, 'Synthetic Full Backup'),
        (CDP, 'Continuous Data Protection'),
    ]

class BackupStatus:
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    PARTIAL = 'partial'
    VERIFYING = 'verifying'
    CHOICES = [
        (PENDING, 'Pending'),
        (RUNNING, 'Running'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
        (CANCELLED, 'Cancelled'),
        (PARTIAL, 'Partial Success'),
        (VERIFYING, 'Verifying Integrity'),
    ]

class MaintenanceType:
    FULL = 'full'
    PARTIAL = 'partial'
    ROLLING = 'rolling'
    EMERGENCY = 'emergency'
    CHOICES = [
        (FULL, 'Full Maintenance - ALL apps stopped'),
        (PARTIAL, 'Partial Maintenance - Specific apps stopped'),
        (ROLLING, 'Rolling Maintenance - Apps restart one by one'),
        (EMERGENCY, 'Emergency Maintenance - Immediate, no schedule'),
    ]

class MaintenanceStatus:
    SCHEDULED = 'scheduled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    FAILED = 'failed'
    CHOICES = [
        (SCHEDULED, 'Scheduled'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
        (FAILED, 'Failed'),
    ]

class DisasterRecoveryType:
    DRILL = 'drill'
    ACTUAL = 'actual'
    FAILOVER = 'failover'
    FAILBACK = 'failback'
    CHOICES = [
        (DRILL, 'Drill/Test - No Production Impact'),
        (ACTUAL, 'Actual Disaster Recovery'),
        (FAILOVER, 'Failover to Standby'),
        (FAILBACK, 'Failback to Primary'),
    ]

class DisasterRecoveryStatus:
    INITIATED = 'initiated'
    IN_PROGRESS = 'in_progress'
    VALIDATING = 'validating'
    SUCCESS = 'success'
    PARTIAL = 'partial'
    FAILED = 'failed'
    ABORTED = 'aborted'
    CHOICES = [
        (INITIATED, 'Initiated'),
        (IN_PROGRESS, 'In Progress'),
        (VALIDATING, 'Validating Recovery'),
        (SUCCESS, 'Success'),
        (PARTIAL, 'Partial Success'),
        (FAILED, 'Failed'),
        (ABORTED, 'Aborted'),
    ]

class HealthStatus:
    HEALTHY = 'healthy'
    DEGRADED = 'degraded'
    UNHEALTHY = 'unhealthy'
    UNKNOWN = 'unknown'
    MAINTENANCE = 'maintenance'
    CHOICES = [
        (HEALTHY, 'Healthy - All Systems Operational'),
        (DEGRADED, 'Degraded - Some Issues'),
        (UNHEALTHY, 'Unhealthy - Critical Issues'),
        (UNKNOWN, 'Unknown - No Data'),
        (MAINTENANCE, 'Maintenance Mode'),
    ]

class RiskLevel:
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'
    CHOICES = [
        (LOW, 'Low Risk'),
        (MEDIUM, 'Medium Risk'),
        (HIGH, 'High Risk'),
        (CRITICAL, 'Critical Risk - Immediate Action Required'),
    ]

class ScheduleType:
    BACKUP = 'backup'
    MAINTENANCE = 'maintenance'
    HEALTH_CHECK = 'health_check'
    DR_DRILL = 'dr_drill'
    CHOICES = [
        (BACKUP, 'Backup Schedule'),
        (MAINTENANCE, 'Maintenance Schedule'),
        (HEALTH_CHECK, 'Health Check Schedule'),
        (DR_DRILL, 'DR Drill Schedule'),
    ]

class ScheduleStatus:
    ACTIVE = 'active'
    PAUSED = 'paused'
    EXPIRED = 'expired'
    DELETED = 'deleted'
    CHOICES = [
        (ACTIVE, 'Active'),
        (PAUSED, 'Paused'),
        (EXPIRED, 'Expired'),
        (DELETED, 'Deleted'),
    ]

class EncryptionKeyStatus:
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    COMPROMISED = 'compromised'
    EXPIRED = 'expired'
    DELETED = 'deleted'
    CHOICES = [
        (ACTIVE, 'Active - Currently Used'),
        (INACTIVE, 'Inactive - Not Used'),
        (COMPROMISED, 'Compromised - Needs Rotation'),
        (EXPIRED, 'Expired - Cannot Use'),
        (DELETED, 'Deleted'),
    ]

class EncryptionKeySource:
    AWS_KMS = 'aws_kms'
    GCP_KMS = 'gcp_kms'
    AZURE_KEYVAULT = 'azure_keyvault'
    HASHICORP_VAULT = 'hashicorp_vault'
    LOCAL_HSM = 'local_hsm'
    CHOICES = [
        (AWS_KMS, 'AWS KMS'),
        (GCP_KMS, 'Google Cloud KMS'),
        (AZURE_KEYVAULT, 'Azure Key Vault'),
        (HASHICORP_VAULT, 'HashiCorp Vault'),
        (LOCAL_HSM, 'Local HSM'),
    ]

class AuditAction:
    REGISTER_APP = 'register_app'
    UNREGISTER_APP = 'unregister_app'
    TRIGGER_BACKUP = 'trigger_backup'
    CANCEL_BACKUP = 'cancel_backup'
    RESTORE_BACKUP = 'restore_backup'
    DELETE_BACKUP = 'delete_backup'
    VERIFY_BACKUP = 'verify_backup'
    CREATE_MAINTENANCE = 'create_maintenance'
    START_MAINTENANCE = 'start_maintenance'
    STOP_MAINTENANCE = 'stop_maintenance'
    CANCEL_MAINTENANCE = 'cancel_maintenance'
    EXTEND_MAINTENANCE = 'extend_maintenance'
    EXECUTE_DR = 'execute_dr'
    RUN_DR_DRILL = 'run_dr_drill'
    FAILOVER = 'failover'
    FAILBACK = 'failback'
    UPDATE_POLICY = 'update_policy'
    ROTATE_KEY = 'rotate_key'
    CHANGE_QUOTA = 'change_quota'
    DELETE_ARTIFACT = 'delete_artifact'
    SCHEDULE_CREATE = 'schedule_create'
    SCHEDULE_UPDATE = 'schedule_update'
    SCHEDULE_DELETE = 'schedule_delete'
    SYSTEM_ACTION = 'system_action'
    CHOICES = [
        (REGISTER_APP, 'Registered App'),
        (UNREGISTER_APP, 'Unregistered App'),
        (TRIGGER_BACKUP, 'Triggered Backup'),
        (CANCEL_BACKUP, 'Cancelled Backup'),
        (RESTORE_BACKUP, 'Restored from Backup'),
        (DELETE_BACKUP, 'Deleted Backup'),
        (VERIFY_BACKUP, 'Verified Backup Integrity'),
        (CREATE_MAINTENANCE, 'Created Maintenance Window'),
        (START_MAINTENANCE, 'Started Maintenance'),
        (STOP_MAINTENANCE, 'Stopped Maintenance'),
        (CANCEL_MAINTENANCE, 'Cancelled Maintenance'),
        (EXTEND_MAINTENANCE, 'Extended Maintenance'),
        (EXECUTE_DR, 'Executed DR Plan'),
        (RUN_DR_DRILL, 'Ran DR Drill'),
        (FAILOVER, 'Performed Failover'),
        (FAILBACK, 'Performed Failback'),
        (UPDATE_POLICY, 'Updated Backup Policy'),
        (ROTATE_KEY, 'Rotated Encryption Key'),
        (CHANGE_QUOTA, 'Changed Backup Quota'),
        (DELETE_ARTIFACT, 'Deleted Backup Artifact'),
        (SCHEDULE_CREATE, 'Created Schedule'),
        (SCHEDULE_UPDATE, 'Updated Schedule'),
        (SCHEDULE_DELETE, 'Deleted Schedule'),
        (SYSTEM_ACTION, 'System Automated Action'),
    ]

class AuditResult:
    SUCCESS = 'success'
    FAILURE = 'failure'
    PARTIAL = 'partial'
    PENDING = 'pending'
    CHOICES = [
        (SUCCESS, 'Success'),
        (FAILURE, 'Failure'),
        (PARTIAL, 'Partial Success'),
        (PENDING, 'Pending'),
    ]

class AppName:
    ACCOUNTS = 'accounts'
    KPI = 'kpi'
    BILLING = 'billing'
    REVIEWS = 'reviews'
    TENANTS = 'tenants'
    STRUCTURE = 'structure'
    DASHBOARD = 'dashboard'
    CHOICES = [
        (ACCOUNTS, 'Accounts & Auth'),
        (KPI, 'KPI Engine'),
        (BILLING, 'Billing & Subscription'),
        (REVIEWS, 'Performance Reviews'),
        (TENANTS, 'Tenant Management'),
        (STRUCTURE, 'Organization Structure'),
        (DASHBOARD, 'Dashboard & Analytics'),
    ]

class RecoveryPriority:
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    CHOICES = [
        (CRITICAL, 'Critical - RTO < 1hr'),
        (HIGH, 'High - RTO < 4hr'),
        (MEDIUM, 'Medium - RTO < 24hr'),
        (LOW, 'Low - RTO < 72hr'),
    ]

class DependencyType:
    HARD = 'hard'
    SOFT = 'soft'
    OPTIONAL = 'optional'
    CHOICES = [
        (HARD, 'Hard Dependency - Must restore first'),
        (SOFT, 'Soft Dependency - Prefer restore first'),
        (OPTIONAL, 'Optional - No strict order'),
    ]

class StorageLocation:
    S3 = 's3'
    GCS = 'gcs'
    AZURE = 'azure'
    LOCAL = 'local'
    NFS = 'nfs'
    TAPE = 'tape'
    CHOICES = [
        (S3, 'AWS S3'),
        (GCS, 'Google Cloud Storage'),
        (AZURE, 'Azure Blob'),
        (LOCAL, 'Local Filesystem'),
        (NFS, 'Network File System'),
        (TAPE, 'Tape Archive'),
    ]

class StorageClass:
    STANDARD = 'standard'
    INTELLIGENT = 'intelligent'
    GLACIER = 'glacier'
    DEEP_ARCHIVE = 'deep_archive'
    CHOICES = [
        (STANDARD, 'Standard - Frequent Access'),
        (INTELLIGENT, 'Intelligent-Tiering'),
        (GLACIER, 'Glacier - Long-term Archive'),
        (DEEP_ARCHIVE, 'Deep Archive - 10+ Years'),
    ]

class CompressionAlgorithm:
    ZSTD = 'zstd'
    GZIP = 'gzip'
    LZ4 = 'lz4'
    CHOICES = [
        (ZSTD, 'zstd'),
        (GZIP, 'gzip'),
        (LZ4, 'lz4'),
    ]

DEFAULT_RETENTION_DAYS = 30
DEFAULT_RPO_MINUTES = 240
DEFAULT_RTO_MINUTES = 480
DEFAULT_BACKUP_TIMEOUT_MINUTES = 60
DEFAULT_MAX_BACKUP_COUNT = 100
DEFAULT_QUOTA_BYTES = 107374182400
DEFAULT_WARNING_THRESHOLD_PERCENT = 80
DEFAULT_MAX_CONSECUTIVE_FAILURES = 3
DEFAULT_RETRY_COUNT = 3
DEFAULT_PARALLEL_WORKERS = 4
DEFAULT_RISK_SCORE_THRESHOLD = 70
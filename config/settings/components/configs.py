"""
Configs App Component

System management options including backup storage, cloud credentials (AWS/GCS/Azure),
encryption & Vault, compression, Disaster Recovery (DR), maintenance mode,
health check thresholds, alert notifications (Email/Slack/Teams/SMS/Twilio),
storage lifecycle, quota management, audit logging, and feature flags.
"""

from config.settings.base import env

# ----------------------------
# Backup Storage Configuration
# ----------------------------
BACKUP_STORAGE_TYPE = env.str('BACKUP_STORAGE_TYPE', default='s3')
BACKUP_S3_BUCKET = env.str('BACKUP_S3_BUCKET', default='falcon-pms-backups')
BACKUP_S3_REGION = env.str('BACKUP_S3_REGION', default='us-east-1')
BACKUP_LOCAL_PATH = env.str('BACKUP_LOCAL_PATH', default='/var/backups/falcon-pms')
CONFIG_INTERNAL_HEALTH_BASE_URL = env.str('CONFIG_INTERNAL_HEALTH_BASE_URL', default='http://127.0.0.1:8000')
BACKUP_NFS_MOUNT = env.str('BACKUP_NFS_MOUNT', default='')
BACKUP_NFS_SERVER = env.str('BACKUP_NFS_SERVER', default='')

# AWS Credentials (for S3)
AWS_ACCESS_KEY_ID = env.str('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = env.str('AWS_SECRET_ACCESS_KEY', default='')
AWS_SESSION_TOKEN = env.str('AWS_SESSION_TOKEN', default='')
AWS_KMS_KEY_ID = env.str('AWS_KMS_KEY_ID', default='')

# Google Cloud Storage (for GCS)
GCS_BUCKET_NAME = env.str('GCS_BUCKET_NAME', default='')
GCS_PROJECT_ID = env.str('GCS_PROJECT_ID', default='')
GOOGLE_APPLICATION_CREDENTIALS = env.str('GOOGLE_APPLICATION_CREDENTIALS', default='')

# Azure Blob Storage
AZURE_CONTAINER_NAME = env.str('AZURE_CONTAINER_NAME', default='')
AZURE_STORAGE_ACCOUNT = env.str('AZURE_STORAGE_ACCOUNT', default='')
AZURE_STORAGE_KEY = env.str('AZURE_STORAGE_KEY', default='')
AZURE_CONNECTION_STRING = env.str('AZURE_CONNECTION_STRING', default='')

# ----------------------------
# Backup Encryption Configuration
# ----------------------------
BACKUP_ENCRYPTION_ENABLED = env.bool('BACKUP_ENCRYPTION_ENABLED', default=True)
BACKUP_ENCRYPTION_ALGORITHM = env.str('BACKUP_ENCRYPTION_ALGORITHM', default='AES-256-GCM')
BACKUP_MASTER_ENCRYPTION_KEY = env.str('BACKUP_MASTER_ENCRYPTION_KEY', default='')

# Encryption Key Management
ENCRYPTION_DEFAULT_KEY_SOURCE = env.str('ENCRYPTION_DEFAULT_KEY_SOURCE', default='aws_kms')
VAULT_ADDR = env.str('VAULT_ADDR', default='')
VAULT_TOKEN = env.str('VAULT_TOKEN', default='')
VAULT_BACKUP_KEY_PATH = env.str('VAULT_BACKUP_KEY_PATH', default='')
ENCRYPTION_KEY_ROTATION_DAYS = env.int('ENCRYPTION_KEY_ROTATION_DAYS', default=90)

# ----------------------------
# Backup Compression Configuration
# ----------------------------
BACKUP_COMPRESSION_ENABLED = env.bool('BACKUP_COMPRESSION_ENABLED', default=True)
BACKUP_COMPRESSION_ALGORITHM = env.str('BACKUP_COMPRESSION_ALGORITHM', default='zstd')
BACKUP_COMPRESSION_LEVEL = env.int('BACKUP_COMPRESSION_LEVEL', default=3)

# ----------------------------
# Backup Performance
# ----------------------------
BACKUP_PARALLEL_WORKERS = env.int('BACKUP_PARALLEL_WORKERS', default=4)
BACKUP_TIMEOUT_MINUTES = env.int('BACKUP_TIMEOUT_MINUTES', default=60)
BACKUP_MAX_RETRIES = env.int('BACKUP_MAX_RETRIES', default=3)
BACKUP_RETRY_DELAY_SECONDS = env.int('BACKUP_RETRY_DELAY_SECONDS', default=60)

# ----------------------------
# Backup Schedule & Retention
# ----------------------------
BACKUP_SCHEDULE_ENABLED = env.bool('BACKUP_SCHEDULE_ENABLED', default=True)
BACKUP_DEFAULT_RETENTION_DAYS = env.int('BACKUP_DEFAULT_RETENTION_DAYS', default=30)
BACKUP_FULL_SCHEDULE = env.str('BACKUP_FULL_SCHEDULE', default='0 2 * * *')
BACKUP_INCREMENTAL_SCHEDULE = env.str('BACKUP_INCREMENTAL_SCHEDULE', default='0 */6 * * *')
BACKUP_MAX_INCREMENTAL_CHAIN = env.int('BACKUP_MAX_INCREMENTAL_CHAIN', default=30)
BACKUP_RETENTION_WEEKS = env.int('BACKUP_RETENTION_WEEKS', default=4)
BACKUP_RETENTION_MONTHS = env.int('BACKUP_RETENTION_MONTHS', default=12)

# ----------------------------
# Disaster Recovery Settings
# ----------------------------
DR_DEFAULT_RTO_MINUTES = env.int('DR_DEFAULT_RTO_MINUTES', default=240)
DR_DEFAULT_RPO_MINUTES = env.int('DR_DEFAULT_RPO_MINUTES', default=60)
DR_AUTO_FAILOVER_ENABLED = env.bool('DR_AUTO_FAILOVER_ENABLED', default=False)
DR_AUTO_FAILBACK_ENABLED = env.bool('DR_AUTO_FAILBACK_ENABLED', default=False)
DR_FAILOVER_TIMEOUT_MINUTES = env.int('DR_FAILOVER_TIMEOUT_MINUTES', default=30)
DR_DRILL_FREQUENCY_DAYS = env.int('DR_DRILL_FREQUENCY_DAYS', default=30)
DR_STANDBY_ENDPOINT = env.str('DR_STANDBY_ENDPOINT', default='')

# ----------------------------
# Maintenance Settings
# ----------------------------
MAINTENANCE_AUTO_APPROVE = env.bool('MAINTENANCE_AUTO_APPROVE', default=False)
MAINTENANCE_DEFAULT_DURATION_MINUTES = env.int('MAINTENANCE_DEFAULT_DURATION_MINUTES', default=60)
MAINTENANCE_NOTIFY_BEFORE_MINUTES = env.int('MAINTENANCE_NOTIFY_BEFORE_MINUTES', default=1440)
MAINTENANCE_MAX_CONCURRENT = env.int('MAINTENANCE_MAX_CONCURRENT', default=3)
MAINTENANCE_EMERGENCY_REQUIRES_SUPER_ADMIN = env.bool('MAINTENANCE_EMERGENCY_REQUIRES_SUPER_ADMIN', default=True)

# ----------------------------
# Health Check Settings
# ----------------------------
HEALTH_CHECK_INTERVAL_SECONDS = env.int('HEALTH_CHECK_INTERVAL_SECONDS', default=300)
HEALTH_CHECK_TIMEOUT_SECONDS = env.int('HEALTH_CHECK_TIMEOUT_SECONDS', default=10)
HEALTH_CHECK_CONSECUTIVE_FAILURES = env.int('HEALTH_CHECK_CONSECUTIVE_FAILURES', default=3)
HEALTH_CONDITIONAL_MAINTENANCE_ENABLED = env.bool('HEALTH_CONDITIONAL_MAINTENANCE_ENABLED', default=True)
HEALTH_CHECK_RESPONSE_TIME_WARNING_MS = env.int('HEALTH_CHECK_RESPONSE_TIME_WARNING_MS', default=2000)
HEALTH_CHECK_RESPONSE_TIME_CRITICAL_MS = env.int('HEALTH_CHECK_RESPONSE_TIME_CRITICAL_MS', default=5000)
HEALTH_CHECK_ERROR_RATE_WARNING_PERCENT = env.int('HEALTH_CHECK_ERROR_RATE_WARNING_PERCENT', default=5)
HEALTH_CHECK_ERROR_RATE_CRITICAL_PERCENT = env.int('HEALTH_CHECK_ERROR_RATE_CRITICAL_PERCENT', default=10)

# ----------------------------
# Notification Settings
# ----------------------------
BACKUP_ALERT_EMAILS = env.list('BACKUP_ALERT_EMAILS', default=[])
DR_ALERT_EMAILS = env.list('DR_ALERT_EMAILS', default=[])
MAINTENANCE_ALERT_EMAILS = env.list('MAINTENANCE_ALERT_EMAILS', default=[])
ALERT_SLACK_WEBHOOK_URL = env.str('ALERT_SLACK_WEBHOOK_URL', default='')
ALERT_TEAMS_WEBHOOK_URL = env.str('ALERT_TEAMS_WEBHOOK_URL', default='')
SMS_ALERTS_ENABLED = env.bool('SMS_ALERTS_ENABLED', default=False)
SMS_ALERT_RECIPIENTS = env.list('SMS_ALERT_RECIPIENTS', default=[])

# Twilio configuration
TWILIO_ACCOUNT_SID = env.str('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = env.str('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = env.str('TWILIO_PHONE_NUMBER', default='')

# ----------------------------
# Storage Lifecycle Management
# ----------------------------
STORAGE_ARCHIVE_DAYS = env.int('STORAGE_ARCHIVE_DAYS', default=90)
STORAGE_DEEP_ARCHIVE_DAYS = env.int('STORAGE_DEEP_ARCHIVE_DAYS', default=365)
STORAGE_LIFECYCLE_ENABLED = env.bool('STORAGE_LIFECYCLE_ENABLED', default=True)
STORAGE_DEFAULT_CLASS = env.str('STORAGE_DEFAULT_CLASS', default='STANDARD')

# ----------------------------
# Quota Management
# ----------------------------
DEFAULT_QUOTA_STORAGE_GB = env.int('DEFAULT_QUOTA_STORAGE_GB', default=100)
DEFAULT_QUOTA_MAX_BACKUPS = env.int('DEFAULT_QUOTA_MAX_BACKUPS', default=100)
DEFAULT_QUOTA_MAX_RESTORES_PER_DAY = env.int('DEFAULT_QUOTA_MAX_RESTORES_PER_DAY', default=10)
QUOTA_WARNING_THRESHOLD_PERCENT = env.int('QUOTA_WARNING_THRESHOLD_PERCENT', default=80)
QUOTA_CRITICAL_THRESHOLD_PERCENT = env.int('QUOTA_CRITICAL_THRESHOLD_PERCENT', default=95)

# ----------------------------
# Audit Logging
# ----------------------------
AUDIT_LOG_RETENTION_DAYS = env.int('AUDIT_LOG_RETENTION_DAYS', default=365)
AUDIT_API_ACCESS_ENABLED = env.bool('AUDIT_API_ACCESS_ENABLED', default=True)
AUDIT_DATA_CHANGES_ENABLED = env.bool('AUDIT_DATA_CHANGES_ENABLED', default=True)
AUDIT_EXPORT_EXTERNAL = env.bool('AUDIT_EXPORT_EXTERNAL', default=False)
AUDIT_EXPORT_PATH = env.str('AUDIT_EXPORT_PATH', default='')

# ----------------------------
# Feature Flags
# ----------------------------
FEATURE_DR_ENABLED = env.bool('FEATURE_DR_ENABLED', default=True)
FEATURE_BACKUP_ENABLED = env.bool('FEATURE_BACKUP_ENABLED', default=True)
FEATURE_MAINTENANCE_ENABLED = env.bool('FEATURE_MAINTENANCE_ENABLED', default=True)
FEATURE_HEALTH_MONITORING_ENABLED = env.bool('FEATURE_HEALTH_MONITORING_ENABLED', default=True)
FEATURE_ADVANCED_ANALYTICS = env.bool('FEATURE_ADVANCED_ANALYTICS', default=False)

# ----------------------------
# Development & Debug Settings
# ----------------------------
CONFIG_DEBUG = env.bool('CONFIG_DEBUG', default=False)
LOG_BACKUP_OPERATIONS = env.bool('LOG_BACKUP_OPERATIONS', default=True)
LOG_DR_OPERATIONS = env.bool('LOG_DR_OPERATIONS', default=True)
LOG_MAINTENANCE_OPERATIONS = env.bool('LOG_MAINTENANCE_OPERATIONS', default=True)
LOG_HEALTH_CHECKS = env.bool('LOG_HEALTH_CHECKS', default=False)

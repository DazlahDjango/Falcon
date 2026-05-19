import PropTypes from 'prop-types';

export const BackupJobType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  app: PropTypes.string,
  app_name: PropTypes.string,
  app_display_name: PropTypes.string,
  backup_type: PropTypes.oneOf(['full', 'incremental', 'differential', 'synthetic', 'cdp']).isRequired,
  status: PropTypes.oneOf(['pending', 'running', 'completed', 'failed', 'cancelled', 'partial', 'verifying']).isRequired,
  triggered_by: PropTypes.string,
  triggered_by_role: PropTypes.oneOf(['super_admin', 'client_admin', 'system']),
  started_at: PropTypes.string,
  completed_at: PropTypes.string,
  duration_seconds: PropTypes.number,
  size_bytes: PropTypes.number,
  original_size_bytes: PropTypes.number,
  compression_ratio: PropTypes.number,
  checksum: PropTypes.string,
  parent_job: PropTypes.string,
  sequence_number: PropTypes.number,
  error_message: PropTypes.string,
  retry_count: PropTypes.number,
  metadata: PropTypes.object,
  created_at: PropTypes.string
});

export const BackupPolicyType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  app: PropTypes.string,
  app_name: PropTypes.string,
  backup_type: PropTypes.oneOf(['full', 'incremental', 'differential', 'synthetic', 'cdp']),
  status: PropTypes.oneOf(['enabled', 'disabled', 'maintenance']),
  schedule_cron: PropTypes.string,
  schedule_weekdays_only: PropTypes.bool,
  retention_days: PropTypes.number,
  retention_full_weeks: PropTypes.number,
  retention_monthly: PropTypes.number,
  compression_enabled: PropTypes.bool,
  compression_algorithm: PropTypes.oneOf(['zstd', 'gzip', 'lz4']),
  encryption_enabled: PropTypes.bool,
  encryption_algorithm: PropTypes.string,
  storage_class: PropTypes.oneOf(['standard', 'intelligent', 'glacier', 'deep_archive']),
  incremental_chain_length: PropTypes.number,
  parallel_backup_workers: PropTypes.number,
  backup_timeout_minutes: PropTypes.number,
  created_at: PropTypes.string,
  updated_at: PropTypes.string
});

export const BackupArtifactType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  backup_job: PropTypes.string,
  storage_location: PropTypes.oneOf(['s3', 'gcs', 'azure', 'local', 'nfs', 'tape']),
  storage_path: PropTypes.string,
  encrypted_key_id: PropTypes.string,
  iv_initialization_vector: PropTypes.string,
  status: PropTypes.oneOf(['uploaded', 'verifying', 'verified', 'corrupt', 'deleted', 'archived']),
  verified_at: PropTypes.string,
  restored_at: PropTypes.string,
  restore_count: PropTypes.number,
  archived_at: PropTypes.string,
  archive_tier: PropTypes.string,
  created_at: PropTypes.string
});

export const BackupStatsType = PropTypes.shape({
  totalBackups: PropTypes.number,
  successfulBackups: PropTypes.number,
  failedBackups: PropTypes.number,
  totalStorageGB: PropTypes.number,
  lastBackupAt: PropTypes.string,
  pending: PropTypes.number,
  running: PropTypes.number,
  failedToday: PropTypes.number
});
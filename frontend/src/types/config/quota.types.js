import PropTypes from 'prop-types';

export const BackupQuotaType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  tenant: PropTypes.string,
  tenant_name: PropTypes.string,
  app: PropTypes.string,
  app_name: PropTypes.string,
  total_backup_storage_bytes: PropTypes.number,
  total_storage_gb: PropTypes.number,
  used_backup_storage_bytes: PropTypes.number,
  used_storage_gb: PropTypes.number,
  usage_percent: PropTypes.number,
  max_backup_count: PropTypes.number,
  max_restore_per_day: PropTypes.number,
  backup_retention_days_override: PropTypes.number,
  warning_threshold_percent: PropTypes.number,
  alert_sent_at: PropTypes.string,
  created_at: PropTypes.string,
  updated_at: PropTypes.string
});
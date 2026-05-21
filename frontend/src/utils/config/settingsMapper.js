/**
 * Map API system settings (snake_case sections) to Redux-friendly shape and back.
 */

export const apiToReduxSettings = (api) => ({
  version: api?.version ?? 1,
  storageType: api?.storage?.storage_type ?? 's3',
  encryptionEnabled: api?.backup?.encryption_enabled ?? true,
  compressionEnabled: api?.backup?.compression_enabled ?? true,
  defaultRetentionDays: api?.backup?.default_retention_days ?? 30,
  maintenanceAutoApprove: api?.maintenance?.auto_approve ?? false,
  backupConcurrencyLimit: api?.backup?.parallel_backup_workers ?? 4,
  healthCheckInterval: api?.maintenance?.health_check_interval_seconds ?? 300,
  drAutoFailover: api?.dr?.auto_failover ?? false,
  notificationChannels: api?.notifications?.channels ?? ['email', 'in_app'],
  alertThresholds: {
    backupFailure: api?.alert_thresholds?.backup_failure ?? api?.notifications?.backup_failure_threshold ?? 3,
    maintenanceOverlap: api?.alert_thresholds?.maintenance_overlap ?? true,
    quotaWarningPercent: api?.alert_thresholds?.quota_warning_percent ?? api?.notifications?.quota_alert_threshold_percent ?? 80,
    healthCheckConsecutiveFailures: api?.alert_thresholds?.health_check_consecutive_failures
      ?? api?.notifications?.health_check_failure_threshold ?? 3,
    maxResponseMs: api?.alert_thresholds?.max_response_ms ?? 5000,
  },
  sections: {
    backup: api?.backup ?? {},
    maintenance: api?.maintenance ?? {},
    dr: api?.dr ?? {},
    notifications: api?.notifications ?? {},
    storage: api?.storage ?? {},
    alert_thresholds: api?.alert_thresholds ?? {},
  },
});

export const buildPatchFromSections = (sections) => ({
  ...(sections.backup && { backup: sections.backup }),
  ...(sections.maintenance && { maintenance: sections.maintenance }),
  ...(sections.dr && { dr: sections.dr }),
  ...(sections.notifications && { notifications: sections.notifications }),
  ...(sections.storage && { storage: sections.storage }),
  ...(sections.alert_thresholds && { alert_thresholds: sections.alert_thresholds }),
});

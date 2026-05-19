import PropTypes from 'prop-types';

export const ConfigSettingsType = PropTypes.shape({
  storageType: PropTypes.oneOf(['s3', 'gcs', 'azure', 'local']),
  encryptionEnabled: PropTypes.bool,
  compressionEnabled: PropTypes.bool,
  defaultRetentionDays: PropTypes.number,
  maintenanceAutoApprove: PropTypes.bool,
  backupConcurrencyLimit: PropTypes.number,
  healthCheckInterval: PropTypes.number,
  drAutoFailover: PropTypes.bool,
  notificationChannels: PropTypes.arrayOf(PropTypes.string),
  alertThresholds: PropTypes.shape({
    backupFailure: PropTypes.number,
    maintenanceOverlap: PropTypes.bool,
    quotaWarningPercent: PropTypes.number,
    healthCheckConsecutiveFailures: PropTypes.number
  })
});

export const DashboardOverviewType = PropTypes.shape({
  apps: PropTypes.shape({
    total: PropTypes.number,
    critical: PropTypes.number,
    healthy: PropTypes.number,
    unhealthy: PropTypes.number
  }),
  maintenance: PropTypes.shape({
    active: PropTypes.number,
    scheduled: PropTypes.number
  }),
  backups: PropTypes.shape({
    pending: PropTypes.number,
    running: PropTypes.number,
    failedToday: PropTypes.number,
    totalStorageGB: PropTypes.number
  }),
  disasterRecovery: PropTypes.shape({
    activePlans: PropTypes.number,
    successfulDrills: PropTypes.number,
    highRiskApps: PropTypes.number
  }),
  schedules: PropTypes.shape({
    active: PropTypes.number
  }),
  quota: PropTypes.shape({
    usagePercent: PropTypes.number
  })
});

export const ApiResponseType = PropTypes.shape({
  success: PropTypes.bool,
  data: PropTypes.any,
  message: PropTypes.string,
  status: PropTypes.number,
  timestamp: PropTypes.string
});

export const PaginatedResponseType = PropTypes.shape({
  count: PropTypes.number,
  next: PropTypes.string,
  previous: PropTypes.string,
  results: PropTypes.array
});
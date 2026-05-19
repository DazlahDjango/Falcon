export const BACKUP_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#eab308', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' },
  running: { label: 'Running', color: '#3b82f6', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
  completed: { label: 'Completed', color: '#10b981', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  failed: { label: 'Failed', color: '#ef4444', bgClass: 'bg-red-100', textClass: 'text-red-800' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bgClass: 'bg-gray-100', textClass: 'text-gray-800' },
  partial: { label: 'Partial', color: '#f97316', bgClass: 'bg-orange-100', textClass: 'text-orange-800' },
  verifying: { label: 'Verifying', color: '#8b5cf6', bgClass: 'bg-purple-100', textClass: 'text-purple-800' }
};

export const MAINTENANCE_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
  in_progress: { label: 'In Progress', bgClass: 'bg-orange-100', textClass: 'text-orange-800' },
  completed: { label: 'Completed', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  cancelled: { label: 'Cancelled', bgClass: 'bg-gray-100', textClass: 'text-gray-800' },
  failed: { label: 'Failed', bgClass: 'bg-red-100', textClass: 'text-red-800' }
};

export const HEALTH_STATUS_CONFIG = {
  healthy: { label: 'Healthy', bgClass: 'bg-green-100', textClass: 'text-green-800', icon: 'check' },
  degraded: { label: 'Degraded', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', icon: 'alert' },
  unhealthy: { label: 'Unhealthy', bgClass: 'bg-red-100', textClass: 'text-red-800', icon: 'x' },
  unknown: { label: 'Unknown', bgClass: 'bg-gray-100', textClass: 'text-gray-800', icon: 'help' },
  maintenance: { label: 'Maintenance', bgClass: 'bg-purple-100', textClass: 'text-purple-800', icon: 'settings' }
};

export const RISK_LEVEL_CONFIG = {
  low: { label: 'Low Risk', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  medium: { label: 'Medium Risk', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' },
  high: { label: 'High Risk', bgClass: 'bg-orange-100', textClass: 'text-orange-800' },
  critical: { label: 'Critical Risk', bgClass: 'bg-red-100', textClass: 'text-red-800' }
};

export const ENCRYPTION_KEY_STATUS_CONFIG = {
  active: { label: 'Active', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  inactive: { label: 'Inactive', bgClass: 'bg-gray-100', textClass: 'text-gray-800' },
  compromised: { label: 'Compromised', bgClass: 'bg-red-100', textClass: 'text-red-800' },
  expired: { label: 'Expired', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' },
  deleted: { label: 'Deleted', bgClass: 'bg-gray-100', textClass: 'text-gray-600' }
};

export const getBackupStatus = (status) => {
  return BACKUP_STATUS_CONFIG[status] || { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
};

export const getMaintenanceStatus = (status) => {
  return MAINTENANCE_STATUS_CONFIG[status] || { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
};

export const getHealthStatus = (status) => {
  return HEALTH_STATUS_CONFIG[status] || HEALTH_STATUS_CONFIG.unknown;
};

export const getRiskLevel = (level) => {
  return RISK_LEVEL_CONFIG[level] || RISK_LEVEL_CONFIG.medium;
};

export const getEncryptionKeyStatus = (status) => {
  return ENCRYPTION_KEY_STATUS_CONFIG[status] || ENCRYPTION_KEY_STATUS_CONFIG.inactive;
};

export const getProgressColor = (percent) => {
  if (percent >= 90) return 'red';
  if (percent >= 70) return 'yellow';
  return 'blue';
};

export const getProgressColorClass = (percent) => {
  if (percent >= 95) return 'bg-red-500';
  if (percent >= 80) return 'bg-yellow-500';
  return 'bg-blue-500';
};
import { FiCheckCircle, FiAlertCircle, FiClock, FiXCircle, FiMinusCircle } from 'react-icons/fi';

const STATUS_CONFIG = {
  success: { icon: FiCheckCircle, color: 'text-green-600 bg-green-100', label: 'Success' },
  completed: { icon: FiCheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' },
  healthy: { icon: FiCheckCircle, color: 'text-green-600 bg-green-100', label: 'Healthy' },
  verified: { icon: FiCheckCircle, color: 'text-green-600 bg-green-100', label: 'Verified' },
  active: { icon: FiCheckCircle, color: 'text-green-600 bg-green-100', label: 'Active' },
  pending: { icon: FiClock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  running: { icon: FiClock, color: 'text-blue-600 bg-blue-100', label: 'Running' },
  in_progress: { icon: FiClock, color: 'text-blue-600 bg-blue-100', label: 'In Progress' },
  scheduled: { icon: FiClock, color: 'text-blue-600 bg-blue-100', label: 'Scheduled' },
  degraded: { icon: FiAlertCircle, color: 'text-yellow-600 bg-yellow-100', label: 'Degraded' },
  warning: { icon: FiAlertCircle, color: 'text-yellow-600 bg-yellow-100', label: 'Warning' },
  failed: { icon: FiXCircle, color: 'text-red-600 bg-red-100', label: 'Failed' },
  unhealthy: { icon: FiXCircle, color: 'text-red-600 bg-red-100', label: 'Unhealthy' },
  corrupt: { icon: FiXCircle, color: 'text-red-600 bg-red-100', label: 'Corrupt' },
  cancelled: { icon: FiMinusCircle, color: 'text-gray-600 bg-gray-100', label: 'Cancelled' },
  unknown: { icon: FiMinusCircle, color: 'text-gray-600 bg-gray-100', label: 'Unknown' }
};

export const StatusBadge = ({ status, customLabel, size = 'md', showIcon = true }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.unknown;
  const Icon = config.icon;
  const label = customLabel || config.label;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${config.color}`}>
      {showIcon && <Icon className={size === 'sm' ? 'text-xs' : 'text-sm'} />}
      {label}
    </span>
  );
};
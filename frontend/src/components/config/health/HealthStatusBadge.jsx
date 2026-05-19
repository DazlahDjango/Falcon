import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle } from 'react-icons/fi';
import { HEALTH_STATUS, HEALTH_STATUS_LABELS } from '../../../config/constants/configConstants';

const STATUS_ICONS = {
  [HEALTH_STATUS.HEALTHY]: FiCheckCircle,
  [HEALTH_STATUS.DEGRADED]: FiAlertTriangle,
  [HEALTH_STATUS.UNHEALTHY]: FiXCircle,
  [HEALTH_STATUS.UNKNOWN]: FiHelpCircle,
  [HEALTH_STATUS.MAINTENANCE]: FiAlertTriangle
};

const STATUS_COLORS = {
  [HEALTH_STATUS.HEALTHY]: 'text-green-600 bg-green-100',
  [HEALTH_STATUS.DEGRADED]: 'text-yellow-600 bg-yellow-100',
  [HEALTH_STATUS.UNHEALTHY]: 'text-red-600 bg-red-100',
  [HEALTH_STATUS.UNKNOWN]: 'text-gray-600 bg-gray-100',
  [HEALTH_STATUS.MAINTENANCE]: 'text-orange-600 bg-orange-100'
};

export const HealthStatusBadge = ({ status, size = 'md', showLabel = true }) => {
  const Icon = STATUS_ICONS[status] || FiHelpCircle;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS[HEALTH_STATUS.UNKNOWN];
  const label = HEALTH_STATUS_LABELS[status] || status;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${colorClass}`}>
      <Icon className={size === 'sm' ? 'text-xs' : 'text-sm'} />
      {showLabel && label}
    </span>
  );
};
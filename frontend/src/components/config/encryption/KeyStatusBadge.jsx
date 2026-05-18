import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiClock, FiMinusCircle } from 'react-icons/fi';
import { ENCRYPTION_KEY_STATUS, ENCRYPTION_KEY_STATUS_LABELS } from '../../../config/constants/configConstants';

const STATUS_ICONS = {
  [ENCRYPTION_KEY_STATUS.ACTIVE]: FiCheckCircle,
  [ENCRYPTION_KEY_STATUS.INACTIVE]: FiMinusCircle,
  [ENCRYPTION_KEY_STATUS.COMPROMISED]: FiAlertTriangle,
  [ENCRYPTION_KEY_STATUS.EXPIRED]: FiClock,
  [ENCRYPTION_KEY_STATUS.DELETED]: FiXCircle
};

const STATUS_COLORS = {
  [ENCRYPTION_KEY_STATUS.ACTIVE]: 'text-green-600 bg-green-100',
  [ENCRYPTION_KEY_STATUS.INACTIVE]: 'text-gray-600 bg-gray-100',
  [ENCRYPTION_KEY_STATUS.COMPROMISED]: 'text-red-600 bg-red-100',
  [ENCRYPTION_KEY_STATUS.EXPIRED]: 'text-yellow-600 bg-yellow-100',
  [ENCRYPTION_KEY_STATUS.DELETED]: 'text-gray-500 bg-gray-100'
};

export const KeyStatusBadge = ({ status, size = 'md' }) => {
  const Icon = STATUS_ICONS[status] || FiMinusCircle;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS[ENCRYPTION_KEY_STATUS.INACTIVE];
  const label = ENCRYPTION_KEY_STATUS_LABELS[status] || status;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${colorClass}`}>
      <Icon className={size === 'sm' ? 'text-xs' : 'text-sm'} />
      {label}
    </span>
  );
};
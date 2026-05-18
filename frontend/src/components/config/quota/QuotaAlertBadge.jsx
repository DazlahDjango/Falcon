import { FiAlertCircle } from 'react-icons/fi';

export const QuotaAlertBadge = ({ usagePercent, warningThreshold = 80, criticalThreshold = 95 }) => {
  if (usagePercent >= criticalThreshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
        <FiAlertCircle size={12} /> Critical
      </span>
    );
  }
  if (usagePercent >= warningThreshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
        <FiAlertCircle size={12} /> Warning
      </span>
    );
  }
  return null;
};
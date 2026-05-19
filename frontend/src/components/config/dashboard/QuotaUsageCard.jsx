import { FiPieChart, FiAlertCircle } from 'react-icons/fi';

export const QuotaUsageCard = ({ usagePercent, totalGB, usedGB }) => {
  const percent = Number(usagePercent) || 0;
  const totalStorage = Number(totalGB) || 0;
  const usedStorage = Number(usedGB) || 0;
  const getProgressColor = () => {
    if (percent >= 95) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  const getStatusText = () => {
    if (percent >= 95) return 'Critical - Upgrade Required';
    if (percent >= 80) return 'Warning - Approaching Limit';
    return 'Healthy';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FiPieChart className="text-teal-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">Storage Quota</h3>
        </div>
        {percent >= 80 && <FiAlertCircle className="text-yellow-500 text-xl" />}
      </div>
      <div className="text-center mb-3">
        <div className="text-3xl font-bold text-gray-800">{percent.toFixed(1)}%</div>
        <div className="text-xs text-gray-500">{getStatusText()}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div className={`h-2 rounded-full transition-all ${getProgressColor()}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      {totalStorage > 0 && usedStorage >= 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Used: {usedStorage.toFixed(1)} GB</span>
          <span>Total: {totalStorage.toFixed(1)} GB</span>
        </div>
      )}
    </div>
  );
};
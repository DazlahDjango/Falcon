export const QuotaUsageBar = ({ used, total, showLabel = true }) => {
  const usedGB = used / (1024 ** 3);
  const totalGB = total / (1024 ** 3);
  const percent = total > 0 ? (used / total) * 100 : 0;

  const getColor = () => {
    if (percent >= 95) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${getColor()}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{usedGB.toFixed(1)} GB used</span>
          <span>{percent.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
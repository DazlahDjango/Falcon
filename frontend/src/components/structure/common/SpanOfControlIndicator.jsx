import React from 'react';

const SpanOfControlIndicator = ({ directReports, totalReports, warningThreshold = 15, criticalThreshold = 20, className = '' }) => {
  const getStatusClass = () => {
    if (directReports >= criticalThreshold) return 'span-critical';
    if (directReports >= warningThreshold) return 'span-warning';
    return 'span-healthy';
  };
  const getStatusText = () => {
    if (directReports >= criticalThreshold) return 'Critical Span';
    if (directReports >= warningThreshold) return 'High Span';
    return 'Healthy Span';
  };
  const percentage = Math.min(100, Math.round((directReports / warningThreshold) * 100));
  return (
    <div className={`span-indicator ${getStatusClass()} ${className}`}>
      <div className="flex items-center gap-1">
        <span className="font-medium">{directReports}</span>
        <span className="text-xs">direct</span>
        {totalReports !== undefined && (
          <>
            <span className="text-gray-400">|</span>
            <span className="font-medium">{totalReports}</span>
            <span className="text-xs">total</span>
          </>
        )}
      </div>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getStatusClass() === 'span-critical' ? 'bg-red-500' : getStatusClass() === 'span-warning' ? 'bg-amber-500' : 'bg-green-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs hidden sm:inline">{getStatusText()}</span>
    </div>
  );
};
export default SpanOfControlIndicator;
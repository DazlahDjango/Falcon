import React from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

const OccupancyGauge = ({ current, capacity, className = '' }) => {
  const occupancyRate = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const getStatus = () => {
    if (occupancyRate >= 95) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical', icon: AlertTriangle };
    if (occupancyRate >= 85) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High', icon: TrendingUp };
    if (occupancyRate >= 70) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Moderate', icon: TrendingUp };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good', icon: TrendingUp };
  };
  const status = getStatus();
  const StatusIcon = status.icon;
  const getFillClass = () => {
    if (occupancyRate >= 90) return 'occupancy-fill-high';
    if (occupancyRate >= 75) return 'occupancy-fill-medium';
    return 'occupancy-fill-low';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Space Utilization</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.color} flex items-center gap-1`}>
          <StatusIcon size={10} />
          <span>{status.label}</span>
        </div>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">Occupancy Rate</span>
          <span className={`font-semibold ${status.color}`}>{occupancyRate}%</span>
        </div>
        <div className="occupancy-bar">
          <div className={`occupancy-fill ${getFillClass()}`} style={{ width: `${Math.min(100, occupancyRate)}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-gray-400 text-xs">Current</div>
          <div className="font-semibold text-gray-900">{current}</div>
        </div>
        <div className="text-gray-300">/</div>
        <div>
          <div className="text-gray-400 text-xs">Capacity</div>
          <div className="font-semibold text-gray-900">{capacity}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Available</div>
          <div className="font-semibold text-green-600">{Math.max(0, capacity - current)}</div>
        </div>
      </div>
      {occupancyRate >= 90 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 text-xs">
          <AlertTriangle size={12} />
          <span>Near capacity. Consider expansion or redistribution.</span>
        </div>
      )}
    </div>
  );
};
export default OccupancyGauge;
import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import PositionBadge from '../common/PositionBadge';

const PositionCard = ({ position, onClick, className = '' }) => {
  if (!position) return null;
  const vacancyStatus = position.current_incumbents_count === 0;
  const isOverOccupied = position.max_incumbents && position.current_incumbents_count > position.max_incumbents;

  return (
    <div
      className={`position-card ${vacancyStatus ? 'position-card-vacant' : ''} ${className}`}
      onClick={() => onClick?.(position)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <PositionBadge position={position} size="lg" showLevel />
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Level {position.level}</span>
          {position.grade && <span className="text-xs text-gray-400 ml-1">({position.grade})</span>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-gray-400" />
          <span className="font-medium">{position.current_incumbents_count}</span>
          <span className="text-gray-500">incumbents</span>
          {position.max_incumbents && (
            <span className="text-gray-400 text-xs">/ {position.max_incumbents}</span>
          )}
        </div>
        {isOverOccupied && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <TrendingUp size={12} /> Over capacity
          </span>
        )}
        {vacancyStatus && (
          <span className="text-xs text-amber-600">Vacant</span>
        )}
      </div>
      {position.reports_to && (
        <div className="mt-2 text-xs text-gray-400">
          Reports to: {position.reports_to}
        </div>
      )}
    </div>
  );
};
export default PositionCard;
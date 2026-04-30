import React from 'react';
import { AlertCircle } from 'lucide-react';

const VacantPositionBadge = ({ position, size = 'sm', showCount = true, className = '' }) => {
  if (!position) return null;
  const isVacant = position.current_incumbents_count === 0;
  if (!isVacant) return null;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full ${sizeClasses[size]} ${className}`}>
      <AlertCircle size={size === 'sm' ? 12 : 14} />
      <span>Vacant</span>
      {showCount && position.max_incumbents && position.max_incumbents > 1 && (
        <span className="text-xs opacity-75">(0/{position.max_incumbents})</span>
      )}
    </span>
  );
};

export default VacantPositionBadge;
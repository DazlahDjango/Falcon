import React from 'react';
import { TrendingUp } from 'lucide-react';

const PositionLevelTag = ({ level, grade, size = 'sm', showIcon = true, className = '' }) => {
  const getLevelColor = () => {
    if (level <= 3) return 'bg-red-100 text-red-800';
    if (level <= 6) return 'bg-orange-100 text-orange-800';
    if (level <= 9) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };
  const getLevelBorder = () => {
    if (level <= 3) return 'border-red-200';
    if (level <= 6) return 'border-orange-200';
    if (level <= 9) return 'border-green-200';
    return 'border-blue-200';
  };
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span className={`inline-flex items-center rounded-full ${getLevelColor()} ${sizeClasses[size]} ${className}`}>
      {showIcon && <TrendingUp size={iconSizes[size]} />}
      <span className="font-medium">Level {level}</span>
      {grade && (
        <>
          <span className="opacity-50">•</span>
          <span className="font-mono">{grade}</span>
        </>
      )}
    </span>
  );
};
export default PositionLevelTag;
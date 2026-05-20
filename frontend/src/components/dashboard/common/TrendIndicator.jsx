import React from 'react';
import PropTypes from 'prop-types';

export const TrendIndicator = ({ trend, value, showIcon = true, className = '' }) => {
  const trendConfig = {
    up: { icon: '📈', color: '#10b981', label: 'Up' },
    down: { icon: '📉', color: '#ef4444', label: 'Down' },
    stable: { icon: '➡️', color: '#6b7280', label: 'Stable' }
  };
  
  const config = trendConfig[trend] || trendConfig.stable;
  const displayValue = value !== undefined ? `${value > 0 ? '+' : ''}${value}%` : null;

  return (
    <div className={`trend-indicator trend-indicator--${trend} ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: config.color }}>
      {showIcon && <span>{config.icon}</span>}
      {displayValue && <span className="trend-value">{displayValue}</span>}
      {!displayValue && <span className="trend-label">{config.label}</span>}
    </div>
  );
};

TrendIndicator.propTypes = {
  trend: PropTypes.oneOf(['up', 'down', 'stable']).isRequired,
  value: PropTypes.number,
  showIcon: PropTypes.bool,
  className: PropTypes.string
};
import React from 'react';
import PropTypes from 'prop-types';
import { TRAFFIC_LIGHT, TRAFFIC_LIGHT_LABELS, TRAFFIC_LIGHT_COLORS } from '../../../config/constants/dashboardConstants';

export const TrafficLight = ({ status, size = 'medium', showLabel = false, className = '' }) => {
  const statusKey = status?.toLowerCase();
  const color = TRAFFIC_LIGHT_COLORS[statusKey] || '#9ca3af';
  const label = TRAFFIC_LIGHT_LABELS[statusKey] || 'Unknown';
  
  const sizeMap = {
    small: { width: 12, height: 12, fontSize: 10 },
    medium: { width: 16, height: 16, fontSize: 12 },
    large: { width: 24, height: 24, fontSize: 14 }
  };
  
  const dimensions = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`traffic-light traffic-light--${statusKey} ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div 
        className="traffic-light__indicator"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 0 2px ${color}20`
        }}
      />
      {showLabel && (
        <span className="traffic-light__label" style={{ fontSize: dimensions.fontSize }}>
          {label}
        </span>
      )}
    </div>
  );
};

TrafficLight.propTypes = {
  status: PropTypes.oneOf(['green', 'yellow', 'red']).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  className: PropTypes.string
};
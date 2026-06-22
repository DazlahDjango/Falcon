// src/components/reviews/common/ReviewTrafficLight.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewTrafficLight = ({
  value,
  thresholds = {
    green: 80,
    yellow: 60,
    red: 0,
  },
  label,
  size = 'md',
  showLabel = true,
  showValue = true,
  className = '',
}) => {
  const getStatus = (val) => {
    if (val >= thresholds.green) return 'green';
    if (val >= thresholds.yellow) return 'yellow';
    return 'red';
  };

  const status = getStatus(value);
  const colorMap = {
    green: '#4caf50',
    yellow: '#ff9800',
    red: '#f44336',
  };

  const sizeMap = {
    sm: { dot: 12, font: '12px' },
    md: { dot: 20, font: '16px' },
    lg: { dot: 28, font: '20px' },
  };

  const sizeConfig = sizeMap[size] || sizeMap.md;

  return (
    <div className={`review-traffic-light ${className}`}>
      <div
        className="review-traffic-light-dot"
        style={{
          width: sizeConfig.dot,
          height: sizeConfig.dot,
          backgroundColor: colorMap[status],
        }}
      />
      <div className="review-traffic-light-content">
        {showValue && (
          <span
            className="review-traffic-light-value"
            style={{ fontSize: sizeConfig.font, color: colorMap[status] }}
          >
            {typeof value === 'number' ? `${Math.round(value)}%` : value}
          </span>
        )}
        {showLabel && <span className="review-traffic-light-label">{label}</span>}
      </div>
    </div>
  );
};

ReviewTrafficLight.propTypes = {
  value: PropTypes.number.isRequired,
  thresholds: PropTypes.shape({
    green: PropTypes.number,
    yellow: PropTypes.number,
    red: PropTypes.number,
  }),
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  showValue: PropTypes.bool,
  className: PropTypes.string,
};

export default ReviewTrafficLight;
// src/components/reviews/common/ReviewScoreGauge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewScoreGauge = ({
  score,
  label,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  showValue = true,
  color = null,
  className = '',
}) => {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const radius = size === 'sm' ? 40 : size === 'lg' ? 80 : 60;
  const strokeWidth = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const getTextSize = () => {
    if (size === 'sm') return '16px';
    if (size === 'lg') return '28px';
    return '22px';
  };

  const gaugeColor = getColor();

  return (
    <div className={`review-score-gauge review-score-${size} ${className}`}>
      <svg
        width={radius * 2 + 20}
        height={radius * 2 + 20}
        viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}
      >
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showValue && (
        <div
          className="review-score-gauge-value"
          style={{ fontSize: getTextSize(), color: gaugeColor }}
        >
          {Math.round(score)}
          {maxScore === 100 && '%'}
        </div>
      )}
      {showLabel && <div className="review-score-gauge-label">{label}</div>}
    </div>
  );
};

ReviewScoreGauge.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string,
  maxScore: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  showValue: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
};

export default ReviewScoreGauge;
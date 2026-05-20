import React from 'react';
import PropTypes from 'prop-types';

export const ScoreGauge = ({ score, size = 100, showLabel = true, className = '' }) => {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (normalizedScore / 100) * circumference;
  
  const getColor = () => {
    if (normalizedScore >= 90) return '#10b981';
    if (normalizedScore >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`score-gauge ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {showLabel && (
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="#1f2937"
          >
            {Math.round(normalizedScore)}%
          </text>
        )}
      </svg>
    </div>
  );
};

ScoreGauge.propTypes = {
  score: PropTypes.number,
  size: PropTypes.number,
  showLabel: PropTypes.bool,
  className: PropTypes.string
};
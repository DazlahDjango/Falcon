// components/tenant/resources/ResourceUsageGauge.jsx
import React from 'react';

const ResourceUsageGauge = ({ resource }) => {
  const percentage = Math.min(resource?.percentage_used || 0, 100);
  const isExceeded = resource?.is_exceeded || false;
  const isWarning = resource?.is_warning || false;

  const getColor = () => {
    if (isExceeded) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#22c55e';
  };

  const getBackgroundColor = () => {
    if (isExceeded) return '#fee2e2';
    if (isWarning) return '#fef9c3';
    return '#dcfce7';
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fontWeight="700"
          fill="#0f172a"
        >
          {Math.round(percentage)}%
        </text>
      </svg>
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <p className="resource-text-sm" style={{ color: '#0f172a', fontWeight: 500 }}>
          {resource?.current_value || 0} / {resource?.limit_value || 0}
        </p>
        <p className="resource-text-xs resource-text-muted">{resource?.resource_type_display || resource?.resource_type}</p>
      </div>
    </div>
  );
};

export default ResourceUsageGauge;
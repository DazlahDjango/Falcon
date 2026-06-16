// src/components/reviews/dashboard/admin/QualityMetrics.jsx
import React from 'react';
import { Award, Star, TrendingUp, Scale, Users } from 'lucide-react';

const QualityMetrics = ({ metrics }) => {
  if (!metrics) return null;

  const stats = [
    {
      icon: <Star size={18} />,
      label: 'Average Score',
      value: metrics.average_score !== null ? `${metrics.average_score}%` : '—',
      color: '#f59e0b',
    },
    {
      icon: <Scale size={18} />,
      label: 'Calibration Impact',
      value: metrics.calibration_impact !== null ? `${metrics.calibration_impact}%` : '—',
      color: '#8b5cf6',
    },
    {
      icon: <Users size={18} />,
      label: 'Calibrated Ratings',
      value: metrics.calibrated_count || 0,
      color: '#3b82f6',
    },
  ];

  return (
    <div className="quality-metrics">
      <h3 className="quality-metrics-title">
        <Award size={18} />
        Quality Metrics
      </h3>
      <div className="quality-metrics-stats">
        {stats.map((stat, index) => (
          <div key={index} className="quality-metrics-stat">
            <div className="quality-metrics-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="quality-metrics-stat-content">
              <span className="quality-metrics-stat-value">{stat.value}</span>
              <span className="quality-metrics-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
      {metrics.distribution && Object.keys(metrics.distribution).length > 0 && (
        <div className="quality-metrics-distribution">
          <span className="quality-metrics-distribution-label">Rating Distribution</span>
          <div className="quality-metrics-distribution-items">
            {Object.entries(metrics.distribution).map(([label, count]) => (
              <div key={label} className="quality-metrics-distribution-item">
                <span className="quality-metrics-distribution-label-text">{label}</span>
                <span className="quality-metrics-distribution-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityMetrics;
// src/components/reviews/competencies/detail/CompetencyUsageStats.jsx
import React from 'react';
import { BarChart3, Users, Star, TrendingUp } from 'lucide-react';

const CompetencyUsageStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="competency-usage-stats">
        <h3 className="competency-usage-stats-title">Usage Statistics</h3>
        <div className="competency-usage-stats-empty">
          <p>No usage data available</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      icon: <Users size={18} />,
      label: 'Total Ratings',
      value: stats.total_ratings || 0,
      color: '#3b82f6',
    },
    {
      icon: <Star size={18} />,
      label: 'Average Rating',
      value: stats.average_rating !== null ? stats.average_rating.toFixed(1) : '—',
      color: '#f59e0b',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Usage Count',
      value: stats.usage_count || 0,
      color: '#22c55e',
    },
  ];

  return (
    <div className="competency-usage-stats">
      <h3 className="competency-usage-stats-title">
        <BarChart3 size={18} />
        Usage Statistics
      </h3>
      <div className="competency-usage-stats-grid">
        {statItems.map((item, index) => (
          <div key={index} className="competency-usage-stats-item">
            <div className="competency-usage-stats-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className="competency-usage-stats-content">
              <span className="competency-usage-stats-value">{item.value}</span>
              <span className="competency-usage-stats-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyUsageStats;
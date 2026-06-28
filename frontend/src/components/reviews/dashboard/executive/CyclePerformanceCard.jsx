// src/components/reviews/dashboard/executive/CyclePerformanceCard.jsx
import React from 'react';
import { TrendingUp, Star, Users, CheckCircle } from 'lucide-react';
import { ReviewScoreGauge } from '../../common';

const CyclePerformanceCard = ({ performance }) => {
  if (!performance) return null;

  const stats = [
    {
      icon: <Star size={16} />,
      label: 'Average Score',
      value: performance.average_score !== null ? `${performance.average_score}%` : '—',
    },
    {
      icon: <CheckCircle size={16} />,
      label: 'Self Assessment',
      value: `${performance.self_assessment_completion || 0}%`,
    },
    {
      icon: <Users size={16} />,
      label: 'Review Completion',
      value: `${performance.review_completion || 0}%`,
    },
  ];

  return (
    <div className="cycle-performance-card">
      <h3 className="cycle-performance-card-title">
        <TrendingUp size={18} />
        Cycle Performance
      </h3>
      <div className="cycle-performance-card-content">
        <div className="cycle-performance-card-header">
          <span className="cycle-performance-card-cycle">{performance.cycle_name || 'Current Cycle'}</span>
        </div>
        <div className="cycle-performance-card-stats">
          {stats.map((stat, index) => (
            <div key={index} className="cycle-performance-card-stat">
              <span className="cycle-performance-card-stat-icon">{stat.icon}</span>
              <span className="cycle-performance-card-stat-value">{stat.value}</span>
              <span className="cycle-performance-card-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
        {performance.distribution && (
          <div className="cycle-performance-card-distribution">
            <span className="cycle-performance-card-distribution-label">Distribution</span>
            <div className="cycle-performance-card-distribution-bars">
              {Object.entries(performance.distribution).map(([label, count]) => (
                <div key={label} className="cycle-performance-card-distribution-item">
                  <span className="cycle-performance-card-distribution-label-text">{label}</span>
                  <span className="cycle-performance-card-distribution-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyclePerformanceCard;
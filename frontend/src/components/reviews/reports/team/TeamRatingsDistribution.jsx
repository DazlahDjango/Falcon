// src/components/reviews/reports/team/TeamRatingsDistribution.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

const TeamRatingsDistribution = ({ distribution = {} }) => {
  const colors = {
    'Outstanding': '#22c55e',
    'Exceeds Expectations': '#8bc34a',
    'Meets Expectations': '#f59e0b',
    'Needs Improvement': '#f97316',
    'Poor': '#ef4444',
  };

  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="team-ratings-distribution">
        <h3 className="team-ratings-distribution-title">
          <BarChart3 size={18} />
          Ratings Distribution
        </h3>
        <div className="team-ratings-distribution-empty">
          <p>No ratings available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-ratings-distribution">
      <h3 className="team-ratings-distribution-title">
        <BarChart3 size={18} />
        Ratings Distribution
      </h3>
      <div className="team-ratings-distribution-list">
        {Object.entries(distribution).map(([label, count]) => (
          <div key={label} className="team-ratings-distribution-item">
            <div className="team-ratings-distribution-item-info">
              <span className="team-ratings-distribution-item-label">{label}</span>
              <span className="team-ratings-distribution-item-count">
                {count} ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="team-ratings-distribution-item-bar">
              <div
                className="team-ratings-distribution-item-fill"
                style={{
                  width: total > 0 ? `${(count / total) * 100}%` : '0%',
                  backgroundColor: colors[label] || '#6b7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRatingsDistribution;
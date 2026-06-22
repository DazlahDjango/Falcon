// src/components/reviews/dashboard/supervisor/RatingsDistributionCard.jsx
import React from 'react';
import { BarChart3, Star } from 'lucide-react';

const RatingsDistributionCard = ({ distribution = {} }) => {
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
      <div className="ratings-distribution-card">
        <h3 className="ratings-distribution-card-title">
          <BarChart3 size={18} />
          Ratings Distribution
        </h3>
        <div className="ratings-distribution-card-empty">
          <p>No ratings yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ratings-distribution-card">
      <h3 className="ratings-distribution-card-title">
        <BarChart3 size={18} />
        Ratings Distribution
      </h3>
      <div className="ratings-distribution-card-list">
        {Object.entries(distribution).map(([label, count]) => (
          <div key={label} className="ratings-distribution-card-item">
            <div className="ratings-distribution-card-item-info">
              <span className="ratings-distribution-card-item-label">{label}</span>
              <span className="ratings-distribution-card-item-count">
                {count} ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="ratings-distribution-card-item-bar">
              <div
                className="ratings-distribution-card-item-fill"
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

export default RatingsDistributionCard;
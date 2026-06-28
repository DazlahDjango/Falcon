// src/components/reviews/final-ratings/stats/ScoreStatistics.jsx
import React from 'react';

const ScoreStatistics = ({ distribution }) => {
  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <div className="score-statistics-empty">
        No distribution data available
      </div>
    );
  }

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const colors = {
    'Outstanding': '#4caf50',
    'Exceeds Expectations': '#8bc34a',
    'Meets Expectations': '#ffeb3b',
    'Needs Improvement': '#ff9800',
    'Poor': '#f44336',
  };

  return (
    <div className="score-statistics">
      <h4 className="score-statistics-title">Rating Distribution</h4>
      <div className="score-statistics-list">
        {Object.entries(distribution).map(([label, count]) => (
          <div key={label} className="score-statistics-item">
            <div className="score-statistics-item-header">
              <span className="score-statistics-item-label">{label}</span>
              <span className="score-statistics-item-count">
                {count} ({total > 0 ? ((count / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="score-statistics-item-bar">
              <div
                className="score-statistics-item-fill"
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

export default ScoreStatistics;
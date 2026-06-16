// src/components/reviews/final-ratings/distribution/RatingDistributionTable.jsx
import React from 'react';
import { Grid, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RatingDistributionTable = ({ distribution = [], total = 0 }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="rating-distribution-table-empty">
        <p>No distribution data available</p>
      </div>
    );
  }

  const sortedDistribution = [...distribution].sort((a, b) => b.percentage - a.percentage);

  const getColor = (label) => {
    const colors = {
      'Outstanding': '#22c55e',
      'Exceeds Expectations': '#8bc34a',
      'Meets Expectations': '#f59e0b',
      'Needs Improvement': '#f97316',
      'Poor': '#ef4444',
    };
    return colors[label] || '#6b7280';
  };

  const getTrendIcon = (percentage) => {
    if (percentage >= 70) return <TrendingUp size={14} color="#22c55e" />;
    if (percentage >= 40) return <Minus size={14} color="#f59e0b" />;
    return <TrendingDown size={14} color="#ef4444" />;
  };

  return (
    <div className="rating-distribution-table">
      <div className="rating-distribution-table-header">
        <h3 className="rating-distribution-table-title">
          <Grid size={18} />
          Distribution Table
        </h3>
        <span className="rating-distribution-table-total">Total: {total} ratings</span>
      </div>

      <div className="rating-distribution-table-container">
        <table className="rating-distribution-table-grid">
          <thead>
            <tr>
              <th>Rating Level</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {sortedDistribution.map((item, index) => (
              <tr key={index}>
                <td className="rating-distribution-table-level">
                  <span
                    className="rating-distribution-table-color"
                    style={{ backgroundColor: item.color || getColor(item.rating_label) }}
                  />
                  <span className="rating-distribution-table-label">{item.rating_label}</span>
                </td>
                <td className="rating-distribution-table-count">{item.count}</td>
                <td className="rating-distribution-table-percentage">
                  <div className="rating-distribution-table-percentage-bar">
                    <div
                      className="rating-distribution-table-percentage-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color || getColor(item.rating_label),
                      }}
                    />
                    <span className="rating-distribution-table-percentage-text">{item.percentage}%</span>
                  </div>
                </td>
                <td className="rating-distribution-table-trend">
                  {getTrendIcon(item.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rating-distribution-table-footer">
        <div className="rating-distribution-table-footer-item">
          <span className="rating-distribution-table-footer-label">Average Rating Level</span>
          <span className="rating-distribution-table-footer-value">
            {sortedDistribution.reduce((acc, item) => acc + (item.percentage * item.count), 0) / total}%
          </span>
        </div>
        <div className="rating-distribution-table-footer-item">
          <span className="rating-distribution-table-footer-label">Most Common Level</span>
          <span className="rating-distribution-table-footer-value">
            {sortedDistribution[0]?.rating_label || '—'}
          </span>
        </div>
        <div className="rating-distribution-table-footer-item">
          <span className="rating-distribution-table-footer-label">Levels Present</span>
          <span className="rating-distribution-table-footer-value">{distribution.length}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionTable;
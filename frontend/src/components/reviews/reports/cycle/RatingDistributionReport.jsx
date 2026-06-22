// src/components/reviews/reports/cycle/RatingDistributionReport.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

const RatingDistributionReport = ({ distribution }) => {
  if (!distribution || !distribution.distribution || distribution.total_ratings === 0) {
    return (
      <div className="rating-distribution-report">
        <h3 className="rating-distribution-report-title">
          <BarChart3 size={18} />
          Rating Distribution
        </h3>
        <div className="rating-distribution-report-empty">
          <p>No ratings available</p>
        </div>
      </div>
    );
  }

  const colors = {
    'Outstanding': '#22c55e',
    'Exceeds Expectations': '#8bc34a',
    'Meets Expectations': '#f59e0b',
    'Needs Improvement': '#f97316',
    'Poor': '#ef4444',
  };

  const total = distribution.total_ratings;

  return (
    <div className="rating-distribution-report">
      <h3 className="rating-distribution-report-title">
        <BarChart3 size={18} />
        Rating Distribution
      </h3>
      
      <div className="rating-distribution-report-summary">
        <span className="rating-distribution-report-total">
          Total Ratings: {total}
        </span>
        <span className="rating-distribution-report-cycle">
          {distribution.cycle_name}
        </span>
      </div>

      <div className="rating-distribution-report-list">
        {distribution.distribution.map((item) => (
          <div key={item.rating_label} className="rating-distribution-report-item">
            <div className="rating-distribution-report-item-info">
              <span
                className="rating-distribution-report-item-color"
                style={{ backgroundColor: item.color || colors[item.rating_label] || '#6b7280' }}
              />
              <span className="rating-distribution-report-item-label">{item.rating_label}</span>
              <span className="rating-distribution-report-item-count">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="rating-distribution-report-item-bar">
              <div
                className="rating-distribution-report-item-fill"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || colors[item.rating_label] || '#6b7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingDistributionReport;
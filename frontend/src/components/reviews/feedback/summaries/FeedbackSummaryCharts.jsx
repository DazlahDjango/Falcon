// src/components/reviews/feedback/summaries/FeedbackSummaryCharts.jsx
import React from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

const FeedbackSummaryCharts = ({ summary }) => {
  if (!summary) return null;

  const ratings = [
    { label: 'Manager', value: summary.avg_manager_rating, max: 5 },
    { label: 'Peer', value: summary.avg_peer_rating, max: 5 },
    { label: 'Subordinate', value: summary.avg_subordinate_rating, max: 5 },
    { label: 'Cross-Dept', value: summary.avg_cross_dept_rating, max: 5 },
  ];

  const validRatings = ratings.filter(r => r.value !== null && r.value !== undefined);

  const stats = [
    {
      icon: <Users size={18} />,
      label: 'Total Responses',
      value: summary.total_responses || 0,
      color: '#3b82f6',
    },
    {
      icon: <Star size={18} />,
      label: 'Average Rating',
      value: summary.overall_avg_rating ? summary.overall_avg_rating.toFixed(1) : '—',
      color: '#f59e0b',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Highest Rating',
      value: validRatings.length > 0 
        ? Math.max(...validRatings.map(r => r.value)).toFixed(1)
        : '—',
      color: '#22c55e',
    },
    {
      icon: <Award size={18} />,
      label: 'Responses',
      value: `${summary.total_responses || 0}`,
      color: '#8b5cf6',
    },
  ];

  const getBarColor = (value) => {
    if (value >= 4) return '#22c55e';
    if (value >= 3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="feedback-summary-charts">
      <div className="feedback-summary-charts-stats">
        {stats.map((stat, index) => (
          <div key={index} className="feedback-summary-charts-stat">
            <div className="feedback-summary-charts-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="feedback-summary-charts-stat-content">
              <span className="feedback-summary-charts-stat-value">{stat.value}</span>
              <span className="feedback-summary-charts-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {validRatings.length > 0 && (
        <div className="feedback-summary-charts-bars">
          <h4 className="feedback-summary-charts-bars-title">Rating Breakdown by Type</h4>
          {ratings.map((rating, index) => {
            const value = rating.value;
            const hasValue = value !== null && value !== undefined;
            const percentage = hasValue ? (value / rating.max) * 100 : 0;
            const color = hasValue ? getBarColor(value) : '#e5e7eb';

            return (
              <div key={index} className="feedback-summary-charts-bar-item">
                <div className="feedback-summary-charts-bar-header">
                  <span className="feedback-summary-charts-bar-label">{rating.label}</span>
                  <span className="feedback-summary-charts-bar-value">
                    {hasValue ? value.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="feedback-summary-charts-bar-track">
                  <div
                    className="feedback-summary-charts-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {summary.common_strengths && summary.common_strengths.length > 0 && (
        <div className="feedback-summary-charts-tags">
          <h4 className="feedback-summary-charts-tags-title">Top Strengths</h4>
          <div className="feedback-summary-charts-tags-list">
            {summary.common_strengths.slice(0, 3).map((strength, index) => (
              <span key={index} className="feedback-summary-charts-tag positive">
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.common_improvements && summary.common_improvements.length > 0 && (
        <div className="feedback-summary-charts-tags">
          <h4 className="feedback-summary-charts-tags-title">Top Improvements</h4>
          <div className="feedback-summary-charts-tags-list">
            {summary.common_improvements.slice(0, 3).map((improvement, index) => (
              <span key={index} className="feedback-summary-charts-tag improvement">
                {improvement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSummaryCharts;
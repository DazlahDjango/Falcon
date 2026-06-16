// src/components/reviews/final-ratings/detail/FinalRatingScoreBreakdown.jsx
import React from 'react';
import { TrendingUp, Award, Target, Star, Scale, Calculator } from 'lucide-react';

const FinalRatingScoreBreakdown = ({ rating }) => {
  const scoreItems = [
    {
      icon: <Target size={18} />,
      label: 'KPI Score',
      value: rating.kpi_score,
      percentage: rating.kpi_score !== null ? `${rating.kpi_score}%` : '—',
    },
    {
      icon: <Star size={18} />,
      label: 'Competency Score',
      value: rating.competency_score,
      percentage: rating.competency_score !== null ? `${rating.competency_score}%` : '—',
    },
    {
      icon: <Scale size={18} />,
      label: 'Raw Total Score',
      value: rating.raw_total_score,
      percentage: rating.raw_total_score !== null ? `${rating.raw_total_score}%` : '—',
    },
    {
      icon: <Calculator size={18} />,
      label: 'Coefficient Applied',
      value: rating.coefficient_applied,
      percentage: rating.coefficient_applied !== null ? `×${rating.coefficient_applied}` : '—',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Adjusted Score',
      value: rating.adjusted_score,
      percentage: rating.adjusted_score !== null ? `${rating.adjusted_score}%` : '—',
    },
    {
      icon: <Award size={18} />,
      label: 'Final Score',
      value: rating.final_score,
      percentage: rating.final_score !== null ? `${rating.final_score}%` : '—',
    },
  ];

  const getColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="final-rating-score-breakdown">
      <h3 className="final-rating-score-breakdown-title">Score Breakdown</h3>
      <div className="final-rating-score-breakdown-items">
        {scoreItems.map((item, index) => (
          <div key={index} className="final-rating-score-breakdown-item">
            <div className="final-rating-score-breakdown-item-header">
              <div className="final-rating-score-breakdown-item-icon">{item.icon}</div>
              <span className="final-rating-score-breakdown-item-label">{item.label}</span>
            </div>
            <div className="final-rating-score-breakdown-item-value">
              <span
                className="final-rating-score-breakdown-item-number"
                style={item.value !== null ? { color: getColor(item.value) } : {}}
              >
                {item.percentage}
              </span>
              {item.value !== null && (
                <div className="final-rating-score-breakdown-item-bar">
                  <div
                    className="final-rating-score-breakdown-item-fill"
                    style={{
                      width: `${Math.min(Math.max(item.value, 0), 100)}%`,
                      backgroundColor: getColor(item.value),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinalRatingScoreBreakdown;
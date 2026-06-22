// src/components/reviews/dashboard/executive/TrendsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendsCard = ({ trends = [] }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="trends-card">
        <h3 className="trends-card-title">
          <TrendingUp size={18} />
          Trends
        </h3>
        <div className="trends-card-empty">
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (current, previous) => {
    if (!previous) return <Minus size={14} color="#6b7280" />;
    if (current > previous) return <TrendingUp size={14} color="#22c55e" />;
    if (current < previous) return <TrendingDown size={14} color="#ef4444" />;
    return <Minus size={14} color="#6b7280" />;
  };

  const getTrendColor = (current, previous) => {
    if (!previous) return '#6b7280';
    if (current > previous) return '#22c55e';
    if (current < previous) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="trends-card">
      <h3 className="trends-card-title">
        <TrendingUp size={18} />
        Score Trends
      </h3>
      <div className="trends-card-list">
        {trends.map((trend, index) => {
          const previousScore = index > 0 ? trends[index - 1].average_score : null;
          const currentScore = trend.average_score;

          return (
            <div key={index} className="trends-card-item">
              <span className="trends-card-item-cycle">{trend.cycle}</span>
              <span className="trends-card-item-date">
                {new Date(trend.end_date).toLocaleDateString()}
              </span>
              <div className="trends-card-item-score">
                <span style={{ color: getTrendColor(currentScore, previousScore) }}>
                  {currentScore !== null ? `${currentScore}%` : '—'}
                </span>
                {getTrendIcon(currentScore, previousScore)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendsCard;
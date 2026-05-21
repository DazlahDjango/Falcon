// frontend/src/pages/dashboard/StaffDashboard/PerformanceTrends.jsx

import React from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const PerformanceTrends = ({ data, loading, onRefresh }) => {
  const trends = data || [];

  const getTrafficLightColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const calculateChange = (current, previous) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const latestTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];

  const change = latestTrend && previousTrend 
    ? calculateChange(latestTrend.score, previousTrend.score)
    : null;

  return (
    <DashboardCard 
      title="Performance Trends" 
      loading={loading}
      onRefresh={onRefresh}
    >
      {change !== null && (
        <div className="trend-summary">
          <div className="trend-change">
            {change > 0 ? '📈' : change < 0 ? '📉' : '➡️'}
            <span style={{ color: change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#6b7280' }}>
              {Math.abs(change).toFixed(1)}% {change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change'}
            </span>
          </div>
        </div>
      )}
      
      <div className="trend-chart">
        {trends.map((trend, index) => (
          <div key={index} className="trend-bar-container">
            <div className="trend-label">{trend.month}</div>
            <div 
              className="trend-bar"
              style={{ 
                height: `${(trend.score / 100) * 150}px`,
                backgroundColor: getTrafficLightColor(trend.score)
              }}
            >
              <span className="trend-value">{trend.score}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="trend-stats">
        <div className="stat">
          <span className="stat-label">Best Score</span>
          <span className="stat-value">
            {Math.max(...trends.map(t => t.score || 0))}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">
            {(trends.reduce((sum, t) => sum + (t.score || 0), 0) / trends.length || 0).toFixed(1)}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Total KPIs</span>
          <span className="stat-value">{trends.length}</span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default PerformanceTrends;
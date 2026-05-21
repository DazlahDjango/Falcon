// frontend/src/pages/dashboard/ManagerDashboard/TeamPerformanceChart.jsx

import React from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const TeamPerformanceChart = ({ data, loading, onRefresh }) => {
  const trends = data || [];

  const getColor = (trafficLight) => {
    switch (trafficLight) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const maxScore = Math.max(...trends.map(t => t.average_score || 0), 100);
  const minScore = Math.min(...trends.map(t => t.average_score || 0), 0);

  return (
    <DashboardCard 
      title="Team Performance Trend" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="performance-chart">
        <div className="chart-header">
          <div className="legend">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
              On Track
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
              At Risk
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
              Off Track
            </span>
          </div>
        </div>
        
        <div className="chart-bars">
          {trends.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-label">{item.month}</div>
              <div 
                className="chart-bar"
                style={{ 
                  height: `${(item.average_score / maxScore) * 100}%`,
                  backgroundColor: getColor(item.traffic_light)
                }}
              >
                <span className="chart-value">{item.average_score}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Best Month:</span>
            <span className="summary-value">
              {trends.reduce((best, t) => (t.average_score > best.score ? { month: t.month, score: t.average_score } : best), { month: '-', score: 0 }).month}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Average Score:</span>
            <span className="summary-value">
              {(trends.reduce((sum, t) => sum + (t.average_score || 0), 0) / trends.length || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default TeamPerformanceChart;
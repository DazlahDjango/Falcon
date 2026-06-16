// src/components/reviews/calibration/analytics/CalibrationSummary.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Calendar, FileText } from 'lucide-react';

const CalibrationSummary = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      icon: <FileText size={18} />,
      label: 'Total Ratings',
      value: summary.total_ratings_calibrated || 0,
      color: '#3b82f6',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Average After Score',
      value: summary.average_after_score?.toFixed(1) || '—',
      color: '#22c55e',
    },
    {
      icon: <Minus size={18} />,
      label: 'Average Change',
      value: summary.average_change?.toFixed(1) || '—',
      color: summary.average_change > 0 ? '#22c55e' : summary.average_change < 0 ? '#ef4444' : '#6b7280',
    },
    {
      icon: <Users size={18} />,
      label: 'Total Adjustments',
      value: summary.total_adjustments || 0,
      color: '#8b5cf6',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Increases',
      value: summary.increases || 0,
      color: '#22c55e',
    },
    {
      icon: <TrendingDown size={18} />,
      label: 'Decreases',
      value: summary.decreases || 0,
      color: '#ef4444',
    },
  ];

  return (
    <div className="calibration-summary">
      <h3 className="calibration-summary-title">Calibration Summary</h3>
      <div className="calibration-summary-stats">
        {stats.map((stat, index) => (
          <div key={index} className="calibration-summary-stat">
            <div className="calibration-summary-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="calibration-summary-stat-content">
              <span className="calibration-summary-stat-value">{stat.value}</span>
              <span className="calibration-summary-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {summary.sessions && summary.sessions.list && (
        <div className="calibration-summary-sessions">
          <h4 className="calibration-summary-sessions-title">Sessions</h4>
          <div className="calibration-summary-sessions-stats">
            <span>Total: {summary.sessions.total || 0}</span>
            <span>Completed: {summary.sessions.completed || 0}</span>
            <span>Cancelled: {summary.sessions.cancelled || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationSummary;
// src/components/reviews/reports/calibration/CalibrationSummary.jsx
import React from 'react';
import { Gavel, TrendingUp, TrendingDown, Users, Calendar, FileText, Minus, AlertTriangle } from 'lucide-react';

const CalibrationSummary = ({ summary }) => {
  if (!summary) {
    return (
      <div className="calibration-summary-report">
        <div className="calibration-summary-report-empty">
          <p>No calibration data available</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: <FileText size={20} />,
      label: 'Total Ratings',
      value: summary.total_ratings_calibrated || 0,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Average After Score',
      value: summary.average_after_score?.toFixed(1) || '—',
      color: '#22c55e',
      bgColor: '#d1fae5',
    },
    {
      icon: <Minus size={20} />,
      label: 'Average Change',
      value: summary.average_change?.toFixed(1) || '—',
      color: summary.average_change > 0 ? '#22c55e' : summary.average_change < 0 ? '#ef4444' : '#6b7280',
      bgColor: '#f3f4f6',
    },
    {
      icon: <Users size={20} />,
      label: 'Total Adjustments',
      value: summary.total_adjustments || 0,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Increases',
      value: summary.increases || 0,
      color: '#22c55e',
      bgColor: '#d1fae5',
    },
    {
      icon: <TrendingDown size={20} />,
      label: 'Decreases',
      value: summary.decreases || 0,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
  ];

  const { sessions = {} } = summary;

  return (
    <div className="calibration-summary-report">
      <h3 className="calibration-summary-report-title">Calibration Summary</h3>

      <div className="calibration-summary-report-stats">
        {stats.map((stat, index) => (
          <div key={index} className="calibration-summary-report-stat">
            <div className="calibration-summary-report-stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="calibration-summary-report-stat-content">
              <span className="calibration-summary-report-stat-value">{stat.value}</span>
              <span className="calibration-summary-report-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="calibration-summary-report-grid">
        {/* Sessions Info */}
        {sessions && (
          <div className="calibration-summary-report-card">
            <h4 className="calibration-summary-report-card-title">
              <Calendar size={16} />
              Sessions
            </h4>
            <div className="calibration-summary-report-sessions">
              <div className="calibration-summary-report-session">
                <span className="calibration-summary-report-session-label">Total</span>
                <span className="calibration-summary-report-session-value">{sessions.total || 0}</span>
              </div>
              <div className="calibration-summary-report-session">
                <span className="calibration-summary-report-session-label" style={{ color: '#22c55e' }}>
                  Completed
                </span>
                <span className="calibration-summary-report-session-value" style={{ color: '#22c55e' }}>
                  {sessions.completed || 0}
                </span>
              </div>
              <div className="calibration-summary-report-session">
                <span className="calibration-summary-report-session-label" style={{ color: '#ef4444' }}>
                  Cancelled
                </span>
                <span className="calibration-summary-report-session-value" style={{ color: '#ef4444' }}>
                  {sessions.cancelled || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Impact Summary */}
        <div className="calibration-summary-report-card">
          <h4 className="calibration-summary-report-card-title">
            <Gavel size={16} />
            Calibration Impact
          </h4>
          <div className="calibration-summary-report-impact">
            <div className="calibration-summary-report-impact-item">
              <span className="calibration-summary-report-impact-label">Total Calibrated</span>
              <span className="calibration-summary-report-impact-value">
                {summary.total_ratings_calibrated || 0}
              </span>
            </div>
            <div className="calibration-summary-report-impact-item">
              <span className="calibration-summary-report-impact-label">Percentage</span>
              <span className="calibration-summary-report-impact-value">
                {(() => {
                  const total = summary.total_ratings_in_cycle || 1;
                  const calibrated = summary.total_ratings_calibrated || 0;
                  return `${Math.round((calibrated / total) * 100)}%`;
                })()}
              </span>
            </div>
            <div className="calibration-summary-report-impact-item">
              <span className="calibration-summary-report-impact-label">Average Before</span>
              <span className="calibration-summary-report-impact-value">
                {summary.average_before_score?.toFixed(1) || '—'}
              </span>
            </div>
            <div className="calibration-summary-report-impact-item">
              <span className="calibration-summary-report-impact-label">Average After</span>
              <span className="calibration-summary-report-impact-value" style={{ color: '#22c55e' }}>
                {summary.average_after_score?.toFixed(1) || '—'}
              </span>
            </div>
          </div>

          {/* Adjustment Summary */}
          <div className="calibration-summary-report-adjustments">
            <div className="calibration-summary-report-adjustment">
              <span className="calibration-summary-report-adjustment-label">Increases</span>
              <span className="calibration-summary-report-adjustment-value" style={{ color: '#22c55e' }}>
                {summary.increases || 0}
              </span>
            </div>
            <div className="calibration-summary-report-adjustment">
              <span className="calibration-summary-report-adjustment-label">Decreases</span>
              <span className="calibration-summary-report-adjustment-value" style={{ color: '#ef4444' }}>
                {summary.decreases || 0}
              </span>
            </div>
            <div className="calibration-summary-report-adjustment">
              <span className="calibration-summary-report-adjustment-label">No Change</span>
              <span className="calibration-summary-report-adjustment-value" style={{ color: '#6b7280' }}>
                {summary.no_change || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.list && sessions.list.length > 0 && (
        <div className="calibration-summary-report-recent">
          <h4 className="calibration-summary-report-recent-title">Recent Sessions</h4>
          <div className="calibration-summary-report-recent-list">
            {sessions.list.slice(0, 5).map((session, index) => (
              <div key={index} className="calibration-summary-report-recent-item">
                <span className="calibration-summary-report-recent-name">{session.name}</span>
                <span className="calibration-summary-report-recent-date">
                  {new Date(session.date).toLocaleDateString()}
                </span>
                <span className="calibration-summary-report-recent-status">
                  {session.status}
                </span>
                <span className="calibration-summary-report-recent-adjustments">
                  {session.adjustments_count} adjustments
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationSummary;
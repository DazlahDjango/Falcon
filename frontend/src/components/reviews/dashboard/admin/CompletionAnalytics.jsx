// src/components/reviews/dashboard/admin/CompletionAnalytics.jsx
import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle } from 'lucide-react';

const CompletionAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  const metrics = [
    {
      icon: <Users size={16} />,
      label: 'Self Assessment',
      value: `${analytics.self_assessment_rate || 0}%`,
      color: '#3b82f6',
    },
    {
      icon: <CheckCircle size={16} />,
      label: 'Supervisor Review',
      value: `${analytics.supervisor_review_rate || 0}%`,
      color: '#22c55e',
    },
    {
      icon: <TrendingUp size={16} />,
      label: 'Final Rating',
      value: `${analytics.final_rating_rate || 0}%`,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="completion-analytics">
      <h3 className="completion-analytics-title">
        <BarChart3 size={18} />
        Completion Analytics
      </h3>
      <div className="completion-analytics-metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="completion-analytics-metric">
            <div className="completion-analytics-metric-icon" style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className="completion-analytics-metric-content">
              <span className="completion-analytics-metric-value">{metric.value}</span>
              <span className="completion-analytics-metric-label">{metric.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="completion-analytics-bar">
        <div className="completion-analytics-bar-item">
          <span className="completion-analytics-bar-label">Self Assessment</span>
          <div className="completion-analytics-bar-track">
            <div
              className="completion-analytics-bar-fill"
              style={{ width: `${analytics.self_assessment_rate || 0}%`, backgroundColor: '#3b82f6' }}
            />
          </div>
        </div>
        <div className="completion-analytics-bar-item">
          <span className="completion-analytics-bar-label">Supervisor Review</span>
          <div className="completion-analytics-bar-track">
            <div
              className="completion-analytics-bar-fill"
              style={{ width: `${analytics.supervisor_review_rate || 0}%`, backgroundColor: '#22c55e' }}
            />
          </div>
        </div>
        <div className="completion-analytics-bar-item">
          <span className="completion-analytics-bar-label">Final Rating</span>
          <div className="completion-analytics-bar-track">
            <div
              className="completion-analytics-bar-fill"
              style={{ width: `${analytics.final_rating_rate || 0}%`, backgroundColor: '#8b5cf6' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionAnalytics;
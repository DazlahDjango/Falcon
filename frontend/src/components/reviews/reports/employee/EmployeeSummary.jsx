// src/components/reviews/reports/employee/EmployeeSummary.jsx
import React from 'react';
import { User, Calendar, Star, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { ReviewStatusBadge, ReviewScoreGauge } from '../../common';

const EmployeeSummary = ({ summary }) => {
  if (!summary) return null;

  const { employee, review_cycle, self_assessment, supervisor_review, final_rating } = summary;

  const stats = [
    {
      icon: <User size={16} />,
      label: 'Employee',
      value: employee?.name || '—',
    },
    {
      icon: <Calendar size={16} />,
      label: 'Cycle',
      value: review_cycle?.name || '—',
    },
    {
      icon: <Star size={16} />,
      label: 'Final Rating',
      value: final_rating?.final_rating_label || '—',
      color: final_rating?.final_rating_color || '#6b7280',
    },
    {
      icon: <Award size={16} />,
      label: 'Final Score',
      value: final_rating?.final_score !== null ? `${final_rating.final_score}%` : '—',
      color: final_rating?.final_score >= 80 ? '#22c55e' : final_rating?.final_score >= 60 ? '#f59e0b' : '#ef4444',
    },
  ];

  return (
    <div className="employee-summary">
      <h3 className="employee-summary-title">Summary</h3>
      
      <div className="employee-summary-stats">
        {stats.map((stat, index) => (
          <div key={index} className="employee-summary-stat">
            <div className="employee-summary-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="employee-summary-stat-content">
              <span className="employee-summary-stat-label">{stat.label}</span>
              <span className="employee-summary-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="employee-summary-grid">
        <div className="employee-summary-section">
          <h4 className="employee-summary-section-title">Self Assessment</h4>
          {self_assessment ? (
            <div className="employee-summary-section-content">
              <div className="employee-summary-section-status">
                <ReviewStatusBadge status={self_assessment.status || 'draft'} size="sm" />
                {self_assessment.submitted_at && (
                  <span className="employee-summary-section-date">
                    Submitted: {new Date(self_assessment.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {self_assessment.overall_comment && (
                <p className="employee-summary-section-text">{self_assessment.overall_comment}</p>
              )}
              {self_assessment.avg_competency_rating && (
                <span className="employee-summary-section-rating">
                  Avg Competency: {self_assessment.avg_competency_rating}/5
                </span>
              )}
            </div>
          ) : (
            <p className="employee-summary-section-empty">No self assessment submitted</p>
          )}
        </div>

        <div className="employee-summary-section">
          <h4 className="employee-summary-section-title">Supervisor Review</h4>
          {supervisor_review ? (
            <div className="employee-summary-section-content">
              <div className="employee-summary-section-status">
                <ReviewStatusBadge status={supervisor_review.status || 'draft'} size="sm" />
                {supervisor_review.submitted_at && (
                  <span className="employee-summary-section-date">
                    Submitted: {new Date(supervisor_review.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {supervisor_review.overall_comment && (
                <p className="employee-summary-section-text">{supervisor_review.overall_comment}</p>
              )}
              {supervisor_review.recommendation && (
                <span className="employee-summary-section-recommendation">
                  Recommendation: {supervisor_review.recommendation}
                </span>
              )}
            </div>
          ) : (
            <p className="employee-summary-section-empty">No supervisor review submitted</p>
          )}
        </div>

        <div className="employee-summary-section full">
          <h4 className="employee-summary-section-title">Final Rating</h4>
          {final_rating ? (
            <div className="employee-summary-section-content">
              <div className="employee-summary-section-status">
                <ReviewStatusBadge status={final_rating.status || 'pending'} size="sm" />
                {final_rating.approved_at && (
                  <span className="employee-summary-section-date">
                    Approved: {new Date(final_rating.approved_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="employee-summary-section-scores">
                <div className="employee-summary-section-score">
                  <span className="employee-summary-section-score-label">KPI Score</span>
                  <span className="employee-summary-section-score-value">
                    {final_rating.kpi_score !== null ? `${final_rating.kpi_score}%` : '—'}
                  </span>
                </div>
                <div className="employee-summary-section-score">
                  <span className="employee-summary-section-score-label">Competency Score</span>
                  <span className="employee-summary-section-score-value">
                    {final_rating.competency_score !== null ? `${final_rating.competency_score}%` : '—'}
                  </span>
                </div>
                <div className="employee-summary-section-score highlight">
                  <span className="employee-summary-section-score-label">Final Score</span>
                  <span className="employee-summary-section-score-value">
                    {final_rating.final_score !== null ? `${final_rating.final_score}%` : '—'}
                  </span>
                </div>
              </div>
              {final_rating.promotion_recommended && (
                <span className="employee-summary-section-promotion">✅ Promotion Recommended</span>
              )}
              {final_rating.pip_recommended && (
                <span className="employee-summary-section-pip">⚠️ PIP Recommended</span>
              )}
            </div>
          ) : (
            <p className="employee-summary-section-empty">No final rating available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSummary;
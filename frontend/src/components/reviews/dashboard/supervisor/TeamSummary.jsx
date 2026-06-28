// src/components/reviews/dashboard/supervisor/TeamSummary.jsx
import React from 'react';
import { Users, CheckCircle, Clock, Star } from 'lucide-react';

const TeamSummary = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      icon: <Users size={20} />,
      label: 'Total Employees',
      value: summary.total_employees || 0,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Self Assessments',
      value: `${summary.self_assessment_completed || 0}/${summary.total_employees || 0}`,
      percentage: summary.self_assessment_percentage || 0,
      color: '#22c55e',
      bgColor: '#d1fae5',
    },
    {
      icon: <Star size={20} />,
      label: 'Reviews Completed',
      value: `${summary.review_completed || 0}/${summary.total_employees || 0}`,
      percentage: summary.review_percentage || 0,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      icon: <Clock size={20} />,
      label: 'Avg Score',
      value: summary.avg_final_score !== null ? `${summary.avg_final_score}%` : '—',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
  ];

  return (
    <div className="team-summary">
      <h3 className="team-summary-title">Team Summary</h3>
      <div className="team-summary-stats">
        {stats.map((stat, index) => (
          <div key={index} className="team-summary-stat">
            <div className="team-summary-stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="team-summary-stat-content">
              <span className="team-summary-stat-value">{stat.value}</span>
              <span className="team-summary-stat-label">{stat.label}</span>
              {stat.percentage !== undefined && (
                <span className="team-summary-stat-percentage" style={{ color: stat.color }}>
                  {stat.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSummary;
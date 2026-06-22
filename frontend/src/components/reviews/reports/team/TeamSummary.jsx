// src/components/reviews/reports/team/TeamSummary.jsx
import React from 'react';
import { Users, TrendingUp, Award, Star, CheckCircle, AlertCircle } from 'lucide-react';

const TeamSummary = ({ summary }) => {
  if (!summary) return null;

  const { total_employees, aggregate_stats, employees = [] } = summary;

  const stats = [
    {
      icon: <Users size={18} />,
      label: 'Total Employees',
      value: total_employees || 0,
      color: '#3b82f6',
    },
    {
      icon: <Star size={18} />,
      label: 'Avg KPI Score',
      value: aggregate_stats?.avg_kpi_score !== null ? `${aggregate_stats.avg_kpi_score}%` : '—',
      color: '#f59e0b',
    },
    {
      icon: <Award size={18} />,
      label: 'Avg Competency Score',
      value: aggregate_stats?.avg_competency_score !== null ? `${aggregate_stats.avg_competency_score}%` : '—',
      color: '#8b5cf6',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Avg Final Score',
      value: aggregate_stats?.avg_final_score !== null ? `${aggregate_stats.avg_final_score}%` : '—',
      color: '#22c55e',
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Promotions Recommended',
      value: aggregate_stats?.promotion_recommendations || 0,
      color: '#06b6d4',
    },
    {
      icon: <AlertCircle size={18} />,
      label: 'PIPs Recommended',
      value: aggregate_stats?.pip_recommendations || 0,
      color: '#ef4444',
    },
  ];

  const topPerformers = employees
    .filter(e => e.final_rating?.final_score >= 80)
    .slice(0, 5);

  return (
    <div className="team-summary-report">
      <h3 className="team-summary-report-title">Team Overview</h3>
      
      <div className="team-summary-report-stats">
        {stats.map((stat, index) => (
          <div key={index} className="team-summary-report-stat">
            <div className="team-summary-report-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="team-summary-report-stat-content">
              <span className="team-summary-report-stat-value">{stat.value}</span>
              <span className="team-summary-report-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {topPerformers.length > 0 && (
        <div className="team-summary-report-performers">
          <h4 className="team-summary-report-performers-title">Top Performers</h4>
          <div className="team-summary-report-performers-list">
            {topPerformers.map((employee, index) => (
              <div key={index} className="team-summary-report-performer">
                <span className="team-summary-report-performer-name">
                  {employee.employee?.name}
                </span>
                <span className="team-summary-report-performer-score">
                  {employee.final_rating?.final_score}%
                </span>
                <span className="team-summary-report-performer-rating">
                  {employee.final_rating?.final_rating_label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSummary;
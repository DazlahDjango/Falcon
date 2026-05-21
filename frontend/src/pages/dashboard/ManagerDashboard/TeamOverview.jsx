// frontend/src/pages/dashboard/ManagerDashboard/TeamOverview.jsx

import React from 'react';
import { DashboardCard, ScoreGauge, TrafficLight, TrendIndicator } from '../../../components/dashboard/common';

export const TeamOverview = ({ data, loading, onRefresh }) => {
  const teamSummary = data?.team_summary || {};
  
  const stats = [
    {
      label: 'Team Members',
      value: teamSummary.total_members || 0,
      icon: '👥',
      color: '#3b82f6'
    },
    {
      label: 'Average Score',
      value: teamSummary.average_score ? `${teamSummary.average_score}%` : 'N/A',
      icon: '📊',
      color: '#10b981'
    },
    {
      label: 'On Track',
      value: teamSummary.total_green || 0,
      icon: '✅',
      color: '#10b981'
    },
    {
      label: 'At Risk',
      value: teamSummary.total_yellow || 0,
      icon: '⚠️',
      color: '#f59e0b'
    },
    {
      label: 'Off Track',
      value: teamSummary.total_red || 0,
      icon: '🔴',
      color: '#ef4444'
    },
    {
      label: 'Submission Rate',
      value: teamSummary.submission_rate ? `${teamSummary.submission_rate}%` : 'N/A',
      icon: '📝',
      color: '#8b5cf6'
    }
  ];

  return (
    <DashboardCard 
      title="Team Overview" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="team-overview-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      {teamSummary.average_score && (
        <div className="team-score-gauge">
          <ScoreGauge 
            score={teamSummary.average_score} 
            size="medium"
            label="Team Average Score"
          />
        </div>
      )}
    </DashboardCard>
  );
};

export default TeamOverview;
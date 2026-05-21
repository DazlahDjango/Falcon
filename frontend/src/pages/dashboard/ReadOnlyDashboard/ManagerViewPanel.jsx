// frontend/src/pages/dashboard/ReadOnlyDashboard/ManagerViewPanel.jsx

import React from 'react';
import { DashboardCard, TrafficLight } from '../../../components/dashboard/common';

export const ManagerViewPanel = ({ data, loading }) => {
  const managerData = data?.data || data;

  const teamMembers = managerData?.team_members || [];

  return (
    <div className="manager-view-panel">
      <DashboardCard title="Team Summary" loading={loading}>
        <div className="team-summary-stats">
          <div className="stat">
            <span className="stat-label">Team Members</span>
            <span className="stat-value">{teamMembers.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">
              {(teamMembers.reduce((sum, m) => sum + (m.overall_score || 0), 0) / teamMembers.length || 0).toFixed(1)}%
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">On Track</span>
            <span className="stat-value">{teamMembers.filter(m => m.traffic_light === 'green').length}</span>
          </div>
        </div>
      </DashboardCard>
      
      <DashboardCard title="Team Members" loading={loading}>
        <div className="team-members-grid">
          {teamMembers.map(member => (
            <div key={member.user_id} className="member-card">
              <div className="member-avatar">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} />
                ) : (
                  <div className="avatar-placeholder">{member.name?.charAt(0)}</div>
                )}
              </div>
              <div className="member-details">
                <div className="member-name">{member.name}</div>
                <div className="member-role">{member.role}</div>
                <div className="member-score">
                  Score: {member.overall_score || 'N/A'}%
                </div>
                <TrafficLight status={member.traffic_light} size="small" />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default ManagerViewPanel;
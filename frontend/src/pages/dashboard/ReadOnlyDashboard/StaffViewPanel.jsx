// frontend/src/pages/dashboard/ReadOnlyDashboard/StaffViewPanel.jsx

import React from 'react';
import { DashboardCard, TrafficLight } from '../../../components/dashboard/common';

export const StaffViewPanel = ({ data, loading }) => {
  const staffData = data?.data || data;

  const kpis = staffData?.kpis || [];

  return (
    <div className="staff-view-panel">
      <DashboardCard title="My Performance" loading={loading}>
        <div className="performance-summary">
          <div className="overall-score">
            <div className="score-label">Overall Score</div>
            <div className="score-value">{staffData?.overall_score || 'N/A'}%</div>
            <TrafficLight status={staffData?.traffic_light} size="medium" />
          </div>
          
          <div className="kpi-summary">
            <div className="kpi-count">
              <span>✅ On Track:</span>
              <strong>{staffData?.green_count || 0}</strong>
            </div>
            <div className="kpi-count">
              <span>⚠️ At Risk:</span>
              <strong>{staffData?.yellow_count || 0}</strong>
            </div>
            <div className="kpi-count">
              <span>🔴 Off Track:</span>
              <strong>{staffData?.red_count || 0}</strong>
            </div>
          </div>
        </div>
      </DashboardCard>
      
      <DashboardCard title="My KPIs" loading={loading}>
        <div className="kpis-list">
          {kpis.map(kpi => (
            <div key={kpi.id} className="kpi-item">
              <div className="kpi-header">
                <span className="kpi-name">{kpi.name}</span>
                <TrafficLight status={kpi.traffic_light} size="small" />
              </div>
              <div className="kpi-details">
                <span>Target: {kpi.target} {kpi.unit}</span>
                <span>Actual: {kpi.actual || 'Not submitted'} {kpi.unit}</span>
                <span>Score: {kpi.score || 'N/A'}%</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default StaffViewPanel;
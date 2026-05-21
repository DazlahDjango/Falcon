// frontend/src/pages/dashboard/ReadOnlyDashboard/ExecutiveViewPanel.jsx

import React from 'react';
import { DashboardCard, TrafficLight } from '../../../components/dashboard/common';

export const ExecutiveViewPanel = ({ data, loading }) => {
  const executiveData = data?.data || data;

  const departments = executiveData?.department_performance || [];

  return (
    <div className="executive-view-panel">
      <DashboardCard title="Organization Overview" loading={loading}>
        <div className="overview-stats">
          <div className="stat">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{executiveData?.organization_overview?.total_employees || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Departments</span>
            <span className="stat-value">{executiveData?.organization_overview?.total_departments || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total KPIs</span>
            <span className="stat-value">{executiveData?.organization_overview?.total_kpis || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Overall Score</span>
            <span className="stat-value">{executiveData?.organization_overview?.overall_score || 'N/A'}</span>
          </div>
        </div>
      </DashboardCard>
      
      <DashboardCard title="Department Performance" loading={loading}>
        <div className="departments-table">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{dept.manager_name}</td>
                  <td>{dept.staff_count}</td>
                  <td>{dept.overall_score || 'N/A'}%</td>
                  <td><TrafficLight status={dept.status} size="small" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ExecutiveViewPanel;
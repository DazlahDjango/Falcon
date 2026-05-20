import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, LoadingSkeleton } from '../../../components/dashboard/common';

export const KpiBreakdownPanel = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="KPI Breakdown">
        <div className="empty-state">No KPI data available</div>
      </DashboardCard>
    );
  }

  const departments = data.by_department || [];

  return (
    <DashboardCard title="KPI Breakdown by Department">
      <div className="kpi-breakdown-table">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>KPIs</th>
              <th>On Track</th>
              <th>At Risk</th>
              <th>Off Track</th>
              <th>Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={index}>
                <td>{dept.department}</td>
                <td>{dept.kpi_count}</td>
                <td className="green">{dept.green_count}</td>
                <td className="yellow">{dept.yellow_count || 0}</td>
                <td className="red">{dept.red_count}</td>
                <td>{Math.round(dept.average_score)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};

KpiBreakdownPanel.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};
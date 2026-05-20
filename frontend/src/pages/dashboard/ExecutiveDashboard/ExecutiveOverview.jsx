import React from 'react';
import { useSelector } from 'react-redux';
import { DashboardCard, ScoreGauge, LoadingSkeleton } from '../../../components/dashboard/common';
import { selectExecutiveOverview, selectExecutiveLoading } from '../../../store/dashboard/selectors/dashboardSelectors';

export const ExecutiveOverview = () => {
  const overview = useSelector(selectExecutiveOverview);
  const loading = useSelector(selectExecutiveLoading);

  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!overview) {
    return (
      <DashboardCard title="Organization Overview">
        <div className="empty-state">No data available</div>
      </DashboardCard>
    );
  }

  const metrics = [
    { label: 'Total Employees', value: overview.total_employees, icon: '👥' },
    { label: 'Total Departments', value: overview.total_departments, icon: '🏢' },
    { label: 'Active KPIs', value: overview.total_kpis, icon: '📊' },
    { label: 'Submission Rate', value: `${overview.overall_submission_rate}%`, icon: '📝' }
  ];

  return (
    <DashboardCard title="Organization Overview">
      <div className="overview-metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
      
      <div className="kpi-status-summary">
        <h4>KPI Health Status</h4>
        <div className="status-bars">
          <div className="status-bar green" style={{ width: `${(overview.kpi_status?.green / overview.total_kpis) * 100}%` }}>
            <span>On Track: {overview.kpi_status?.green}</span>
          </div>
          <div className="status-bar yellow" style={{ width: `${(overview.kpi_status?.yellow / overview.total_kpis) * 100}%` }}>
            <span>At Risk: {overview.kpi_status?.yellow}</span>
          </div>
          <div className="status-bar red" style={{ width: `${(overview.kpi_status?.red / overview.total_kpis) * 100}%` }}>
            <span>Off Track: {overview.kpi_status?.red}</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
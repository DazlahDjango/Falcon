import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { ROUTES } from '../../../config/constants';

const ClientAdminReports = () => (
  <DashboardPageShell
    title="Analytics & Reports"
    subtitle="Performance operations"
    dashboardType="client_admin"
  >
    <div className="dashboard-page__panel">
      <p className="dashboard-page__description">
        Deep analytics live in the KPI app. Compliance and operational summaries stay on this dashboard.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Link to={ROUTES.KPI_REPORTS} className="dashboard-refresh-btn">KPI Reports</Link>
        <Link to={ROUTES.KPI_DASHBOARD} className="dashboard-refresh-btn">KPI Dashboard</Link>
      </div>
    </div>
  </DashboardPageShell>
);

export default ClientAdminReports;

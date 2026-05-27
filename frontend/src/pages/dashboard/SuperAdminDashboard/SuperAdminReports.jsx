import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { BILLING_ROUTES } from '../../../config/constants/billingRouteConstants';

const SuperAdminReports = () => (
  <DashboardPageShell
    title="Platform Reports"
    subtitle="Cross-tenant analytics"
    dashboardType="super_admin"
  >
    <div className="dashboard-page__panel">
      <p className="dashboard-page__description">
        Revenue and subscription reports are maintained in the Billing app.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Link to={BILLING_ROUTES.ADMIN_ANALYTICS} className="dashboard-refresh-btn">Billing Analytics</Link>
        <Link to="/config/audit-logs" className="dashboard-refresh-btn">Config Audit Logs</Link>
      </div>
    </div>
  </DashboardPageShell>
);

export default SuperAdminReports;

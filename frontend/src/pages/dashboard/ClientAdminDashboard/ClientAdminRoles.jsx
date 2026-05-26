import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { RoleList } from '../../../components/dashboard/integrations';

const ClientAdminRoles = () => (
  <DashboardPageShell
    title="Roles & Permissions"
    subtitle="Accounts RBAC"
    dashboardType="client_admin"
  >
    <div className="dashboard-page__panel dashboard-embed-accounts">
      <RoleList />
    </div>
  </DashboardPageShell>
);

export default ClientAdminRoles;

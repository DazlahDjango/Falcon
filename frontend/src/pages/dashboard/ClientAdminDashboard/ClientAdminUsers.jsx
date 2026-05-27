import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { UserList } from '../../../components/dashboard/integrations';

const ClientAdminUsers = () => (
  <DashboardPageShell
    title="Users"
    subtitle="Accounts directory"
    description="Managed via Accounts app — same RBAC and audit trail as platform user management."
    dashboardType="client_admin"
  >
    <div className="dashboard-page__panel dashboard-embed-accounts">
      <UserList />
    </div>
  </DashboardPageShell>
);

export default ClientAdminUsers;

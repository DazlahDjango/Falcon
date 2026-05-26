import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { UserActivityPanel } from './UserActivityPanel';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminUserActivity = () => {
  const { userActivity, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="User Activity"
      subtitle="Engagement & submissions"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <UserActivityPanel data={userActivity} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminUserActivity;

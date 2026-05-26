import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { PendingApprovalsPanel } from './PendingApprovalsPanel';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminApprovals = () => {
  const { pendingApprovals, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Pending Approvals"
      subtitle="Supervisor validation queue"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <PendingApprovalsPanel data={pendingApprovals} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminApprovals;

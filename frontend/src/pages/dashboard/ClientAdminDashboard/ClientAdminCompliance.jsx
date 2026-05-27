import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { CompliancePanel } from './CompliancePanel';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminCompliance = () => {
  const { compliance, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Compliance"
      subtitle="Submission & review completion"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <CompliancePanel data={compliance} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminCompliance;

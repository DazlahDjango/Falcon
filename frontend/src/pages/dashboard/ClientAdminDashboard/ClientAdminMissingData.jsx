import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { MissingDataPanel } from './MissingDataPanel';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminMissingData = () => {
  const { missingData, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Missing Data"
      subtitle="Outstanding submissions"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <MissingDataPanel data={missingData} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminMissingData;

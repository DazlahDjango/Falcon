import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { ExportHistory } from '../../../components/dashboard/exports';
import { useDashboardExports } from '../../../hooks/dashboard/useDashboardExports';

const ClientAdminExports = () => {
  const { history, loading, fetchHistory } = useDashboardExports({ autoFetch: true });

  return (
    <DashboardPageShell
      title="Exports"
      subtitle="Tenant data exports"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={fetchHistory}
    >
      <div className="dashboard-page__panel">
        <ExportHistory history={history} loading={loading} onRefresh={fetchHistory} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminExports;

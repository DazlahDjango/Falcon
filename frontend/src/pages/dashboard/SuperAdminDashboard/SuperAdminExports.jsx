import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { ExportHistory } from '../../../components/dashboard/exports';
import { useDashboardExports } from '../../../hooks/dashboard/useDashboardExports';

const SuperAdminExports = () => {
  const { history, loading, fetchHistory } = useDashboardExports({ autoFetch: true });

  return (
    <DashboardPageShell
      title="Platform Exports"
      subtitle="Data extracts"
      dashboardType="super_admin"
      loading={loading}
      onRefresh={fetchHistory}
    >
      <div className="dashboard-page__panel">
        <ExportHistory history={history} loading={loading} onRefresh={fetchHistory} />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminExports;

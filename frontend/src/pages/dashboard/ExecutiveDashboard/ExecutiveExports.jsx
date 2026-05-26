import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { ExportHistory } from '../../../components/dashboard/exports';
import { useDashboardExports } from '../../../hooks/dashboard/useDashboardExports';

const ExecutiveExports = () => {
  const { history, loading, fetchHistory } = useDashboardExports({ autoFetch: true });

  return (
    <DashboardPageShell
      title="Exports"
      subtitle="Executive reports"
      description="Scheduled and on-demand exports respect your visibility scope."
      dashboardType="executive"
      loading={loading}
      onRefresh={fetchHistory}
    >
      <div className="dashboard-page__panel">
        <ExportHistory history={history} loading={loading} onRefresh={fetchHistory} />
      </div>
    </DashboardPageShell>
  );
};

export default ExecutiveExports;

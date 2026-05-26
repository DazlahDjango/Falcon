import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { SystemHealthPanel } from './SystemHealthPanel';
import { SystemMetricsDashboard } from '../../../components/dashboard/integrations';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminSystemHealth = () => {
  const { systemHealth, loading, refreshDashboard } = useSuperAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="System Health"
      subtitle="Platform availability"
      description="PMS health from Dashboard API plus Config Manager infrastructure metrics."
      dashboardType="super_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <SystemHealthPanel data={systemHealth} loading={loading} />
      </div>
      <div className="dashboard-page__panel dashboard-embed-config">
        <SystemMetricsDashboard />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminSystemHealth;

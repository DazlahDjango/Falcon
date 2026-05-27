import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { PlatformMetrics } from './PlatformMetrics';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminPlatformMetrics = () => {
  const { platformMetrics, loading, refreshDashboard } = useSuperAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Platform Metrics"
      subtitle="Usage & growth"
      dashboardType="super_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <PlatformMetrics data={platformMetrics} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminPlatformMetrics;

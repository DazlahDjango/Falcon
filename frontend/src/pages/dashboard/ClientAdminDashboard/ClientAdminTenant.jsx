import React, { useEffect } from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { TenantOverview } from './TenantOverview';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminTenant = () => {
  const { dashboardData, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <DashboardPageShell
      title="Tenant Overview"
      subtitle="Client administration"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <TenantOverview data={dashboardData?.tenant_overview} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminTenant;

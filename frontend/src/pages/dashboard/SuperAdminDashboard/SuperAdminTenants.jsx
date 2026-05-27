import React, { useEffect } from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { TenantsTable } from './TenantsTable';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminTenants = () => {
  const { tenants, tenantsLoading, fetchTenants } = useSuperAdminDashboard({ autoRefresh: true });

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return (
    <DashboardPageShell
      title="Tenants"
      subtitle="Platform clients"
      description="Live tenant registry from Tenant app. Changes propagate via WebSocket."
      dashboardType="super_admin"
      loading={tenantsLoading}
      onRefresh={fetchTenants}
    >
      <div className="dashboard-page__panel">
        <TenantsTable data={tenants} loading={tenantsLoading} onRefresh={fetchTenants} />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminTenants;

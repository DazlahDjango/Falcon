import React, { useEffect } from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { TenantsTable } from './TenantsTable';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminTenants = () => {
<<<<<<< HEAD
  const { tenants, tenantsLoading, fetchTenants } = useSuperAdminDashboard({ autoRefresh: true });
=======
  const { tenants, tenantsLoading, fetchTenants, refreshTenantSnapshot } = useSuperAdminDashboard({ autoRefresh: true });
>>>>>>> 5f1485efe72578f098c861e800fe246c25520289

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
<<<<<<< HEAD
        <TenantsTable data={tenants} loading={tenantsLoading} onRefresh={fetchTenants} />
=======
        <TenantsTable 
          data={tenants} 
          loading={tenantsLoading} 
          onRefresh={fetchTenants} 
          onRefreshTenant={refreshTenantSnapshot}
        />
>>>>>>> 5f1485efe72578f098c861e800fe246c25520289
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminTenants;

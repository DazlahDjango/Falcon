import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { KpiBreakdownPanel } from './KpiBreakdownPanel';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

const ClientAdminKpiBreakdown = () => {
  const { kpiBreakdown, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="KPI Breakdown"
      subtitle="Tenant performance mix"
      dashboardType="client_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <KpiBreakdownPanel data={kpiBreakdown} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ClientAdminKpiBreakdown;

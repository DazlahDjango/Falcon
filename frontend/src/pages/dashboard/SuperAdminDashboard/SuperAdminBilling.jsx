import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { BillingOverview } from './BillingOverview';
import { AdminBillingPage } from '../../../components/dashboard/integrations';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminBilling = () => {
  const { billingOverview, loading, refreshDashboard } = useSuperAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Billing"
      subtitle="Revenue & transactions"
      dashboardType="super_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <BillingOverview data={billingOverview} loading={loading} />
      </div>
      <div className="dashboard-page__panel">
        <AdminBillingPage />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminBilling;

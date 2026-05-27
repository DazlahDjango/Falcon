import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { SubscriptionAlerts } from './SubscriptionAlerts';
import { AdminSubscriptionsPage } from '../../../components/dashboard/integrations';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminSubscriptions = () => {
  const { subscriptionAlerts, loading, refreshDashboard } = useSuperAdminDashboard({ autoRefresh: true });

  return (
    <DashboardPageShell
      title="Subscriptions"
      subtitle="Billing & plans"
      dashboardType="super_admin"
      loading={loading}
      onRefresh={refreshDashboard}
    >
      <div className="dashboard-page__panel">
        <SubscriptionAlerts data={subscriptionAlerts} loading={loading} />
      </div>
      <div className="dashboard-page__panel dashboard-embed-accounts">
        <AdminSubscriptionsPage />
      </div>
    </DashboardPageShell>
  );
};

export default SuperAdminSubscriptions;

import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { PlatformOverview } from './PlatformOverview';
import { TenantsTable } from './TenantsTable';
import { SystemHealthPanel } from './SystemHealthPanel';
import { PlatformMetrics } from './PlatformMetrics';
import { BillingOverview } from './BillingOverview';
import { SubscriptionAlerts } from './SubscriptionAlerts'
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';

const SuperAdminDashboard = () => {
  const {
    dashboardData,
    tenants,
    systemHealth,
    subscriptionAlerts,
    platformMetrics,
    billingOverview,
    loading,
    refreshDashboard
  } = useSuperAdminDashboard({ autoRefresh: true, refreshInterval: 60000 });
  // Hook handles all data fetching with autoRefresh:true

  const widgets = [
    {
      id: 'platform-overview',
      widget_type: 'custom',
      title: 'Platform Overview',
      row: 0,
      col: 0,
      width: 12,
      height: 3,
      component: PlatformOverview,
      data: dashboardData?.platform_overview,
      loading
    },
    {
      id: 'tenants',
      widget_type: 'tenant_summary',
      title: 'Active Tenants',
      row: 3,
      col: 0,
      width: 8,
      height: 5,
      data: tenants,
      loading
    },
    {
      id: 'subscription-alerts',
      widget_type: 'subscription_status',
      title: 'Subscription Alerts',
      row: 3,
      col: 8,
      width: 4,
      height: 5,
      data: subscriptionAlerts,
      loading
    },
    {
      id: 'system-health',
      widget_type: 'custom',
      title: 'System Health',
      row: 8,
      col: 0,
      width: 4,
      height: 3,
      component: SystemHealthPanel,
      data: systemHealth,
      loading
    },
    {
      id: 'platform-metrics',
      widget_type: 'custom',
      title: 'Platform Metrics',
      row: 8,
      col: 4,
      width: 4,
      height: 3,
      component: PlatformMetrics,
      data: platformMetrics,
      loading
    },
    {
      id: 'billing-overview',
      widget_type: 'custom',
      title: 'Billing Overview',
      row: 8,
      col: 8,
      width: 4,
      height: 3,
      component: BillingOverview,
      data: billingOverview,
      loading
    }
  ];

  const layout = {
    columns: 12,
    cellHeight: 100,
    margin: 10
  };

  return (
    <DashboardLayout
      dashboardType="super_admin"
      widgets={widgets}
      layout={layout}
      onSaveLayout={() => {}}
      onAddWidget={() => {}}
      onUpdateWidget={() => {}}
      onRemoveWidget={() => {}}
      onRefresh={refreshDashboard}
      loading={loading}
    />
  );
};

export default SuperAdminDashboard;
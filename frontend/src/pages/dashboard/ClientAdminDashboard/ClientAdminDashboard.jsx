import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { TenantOverview, CompliancePanel, PendingApprovalsPanel, MissingDataPanel, KpiBreakdownPanel, UserActivityPanel } from './';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';
import { fetchClientAdminDashboard, setActiveDashboard } from '../../../store/dashboard/slices/dashboardSlice';

const ClientAdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboardData,
    compliance,
    pendingApprovals,
    missingData,
    userActivity,
    kpiBreakdown,
    loading,
    refreshDashboard
  } = useClientAdminDashboard({ autoRefresh: true, refreshInterval: 60000 });

  useEffect(() => {
    dispatch(setActiveDashboard('client_admin'));
    dispatch(fetchClientAdminDashboard());
  }, [dispatch]);

  const widgets = [
    {
      id: 'tenant-overview',
      widget_type: 'custom',
      title: 'Tenant Overview',
      row: 0,
      col: 0,
      width: 6,
      height: 3,
      component: TenantOverview,
      data: dashboardData?.tenant_overview,
      loading
    },
    {
      id: 'compliance',
      widget_type: 'compliance',
      title: 'Compliance Status',
      row: 0,
      col: 6,
      width: 6,
      height: 3,
      data: compliance,
      loading
    },
    {
      id: 'pending-approvals',
      widget_type: 'pending_approvals',
      title: 'Pending Approvals',
      row: 3,
      col: 0,
      width: 6,
      height: 4,
      data: pendingApprovals,
      loading
    },
    {
      id: 'missing-data',
      widget_type: 'missing_data',
      title: 'Missing Data Alerts',
      row: 3,
      col: 6,
      width: 6,
      height: 4,
      data: missingData,
      loading
    },
    {
      id: 'kpi-breakdown',
      widget_type: 'custom',
      title: 'KPI Breakdown',
      row: 7,
      col: 0,
      width: 6,
      height: 3,
      component: KpiBreakdownPanel,
      data: kpiBreakdown,
      loading
    },
    {
      id: 'user-activity',
      widget_type: 'custom',
      title: 'User Activity',
      row: 7,
      col: 6,
      width: 6,
      height: 3,
      component: UserActivityPanel,
      data: userActivity,
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
      dashboardType="client_admin"
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

export default ClientAdminDashboard;
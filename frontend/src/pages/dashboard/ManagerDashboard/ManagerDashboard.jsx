// frontend/src/pages/dashboard/ManagerDashboard/ManagerDashboard.jsx

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { useManagerDashboard } from '../../../hooks/dashboard/useManagerDashboard';
import {
  fetchManagerDashboard,
  fetchTeamMembers,
  fetchTeamSummary,
  fetchPendingApprovals,
} from '../../../store/dashboard/slices/managerDashboardSlice';
import { setActiveDashboard } from '../../../store/dashboard/slices/dashboardSlice';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboardData,
    teamMembers,
    teamSummary,
    pendingApprovals,
    period,
    includeTeam,
    loading,
    refreshDashboard,
    loadTeamMembers,
    loadTeamSummary,
    loadPendingApprovals,
    setPeriod,
    setIncludeTeam
  } = useManagerDashboard({ autoFetch: true });

  useEffect(() => {
    dispatch(setActiveDashboard('manager'));
    dispatch(fetchManagerDashboard({ period, includeTeam }));
    dispatch(fetchTeamMembers());
    dispatch(fetchTeamSummary());
    dispatch(fetchPendingApprovals());
  }, [dispatch, period, includeTeam]);

  const widgets = [
    {
      id: 'personal_kpis',
      widget_type: 'kpi_list',
      title: 'My KPIs',
      row: 0,
      col: 0,
      width: 6,
      height: 4,
      data: dashboardData?.personal_kpis,
      loading: loading,
      onRefresh: refreshDashboard
    },
    {
      id: 'team_summary',
      widget_type: 'team_performance',
      title: 'Team Summary',
      row: 0,
      col: 6,
      width: 6,
      height: 4,
      data: teamSummary,
      loading: loading,
      onRefresh: loadTeamSummary
    },
    {
      id: 'team_members',
      widget_type: 'team_list',
      title: 'Team Members',
      row: 4,
      col: 0,
      width: 8,
      height: 5,
      data: teamMembers,
      loading: loading,
      onRefresh: loadTeamMembers
    },
    {
      id: 'pending_approvals',
      widget_type: 'pending_approvals',
      title: 'Pending Approvals',
      row: 4,
      col: 8,
      width: 4,
      height: 5,
      data: pendingApprovals,
      loading: loading,
      onRefresh: loadPendingApprovals
    }
  ];

  const layout = {
    columns: 12,
    cellHeight: 100,
    margin: 10
  };

  const handleSaveLayout = async (newLayout) => {
    console.log('Saving manager dashboard layout:', newLayout);
  };

  const handleAddWidget = async (widgetData) => {
    console.log('Adding widget to manager dashboard:', widgetData);
  };

  const handleUpdateWidget = async (widgetId, widgetData) => {
    console.log('Updating widget on manager dashboard:', widgetId, widgetData);
  };

  const handleRemoveWidget = async (widgetId) => {
    console.log('Removing widget from manager dashboard:', widgetId);
  };

  return (
    <DashboardLayout
      dashboardType="manager"
      widgets={widgets}
      layout={layout}
      onSaveLayout={handleSaveLayout}
      onAddWidget={handleAddWidget}
      onUpdateWidget={handleUpdateWidget}
      onRemoveWidget={handleRemoveWidget}
      onRefresh={refreshDashboard}
      loading={loading}
    />
  );
};

export default ManagerDashboard;
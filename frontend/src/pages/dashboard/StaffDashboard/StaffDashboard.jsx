// frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx

import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { useStaffDashboard } from '../../../hooks/dashboard/useStaffDashboard';

const StaffDashboard = () => {
  const {
    dashboardData,
    myKPIs,
    pendingSubmissions,
    missionStatus,
    pendingTasks,
    period,
    loading,
    refreshDashboard,
    loadMyKPIs,
    loadMissionStatus,
    loadPendingTasks,
    setPeriod
  } = useStaffDashboard({ autoFetch: true });
  // Hook handles all data fetching with autoFetch:true

  const widgets = [
    {
      id: 'my_kpis',
      widget_type: 'kpi_list',
      title: 'My KPIs',
      row: 0,
      col: 0,
      width: 6,
      height: 5,
      data: myKPIs,
      loading: loading,
      onRefresh: loadMyKPIs
    },
    {
      id: 'mission_status',
      widget_type: 'mission_status',
      title: 'Mission Status Report',
      row: 0,
      col: 6,
      width: 6,
      height: 3,
      data: missionStatus,
      loading: loading,
      onRefresh: loadMissionStatus
    },
    {
      id: 'pending_tasks',
      widget_type: 'pending_tasks',
      title: 'Pending Tasks',
      row: 3,
      col: 6,
      width: 6,
      height: 4,
      data: pendingTasks,
      loading: loading,
      onRefresh: loadPendingTasks
    },
    {
      id: 'performance_trends',
      widget_type: 'trend_chart',
      title: 'Performance Trends',
      row: 5,
      col: 0,
      width: 12,
      height: 3,
      data: dashboardData?.kpis,
      loading: loading,
      onRefresh: refreshDashboard
    }
  ];

  const layout = {
    columns: 12,
    cellHeight: 100,
    margin: 10
  };

  const handleSaveLayout = async (newLayout) => {
    console.log('Saving staff dashboard layout:', newLayout);
  };

  const handleAddWidget = async (widgetData) => {
    console.log('Adding widget to staff dashboard:', widgetData);
  };

  const handleUpdateWidget = async (widgetId, widgetData) => {
    console.log('Updating widget on staff dashboard:', widgetId, widgetData);
  };

  const handleRemoveWidget = async (widgetId) => {
    console.log('Removing widget from staff dashboard:', widgetId);
  };

  return (
    <DashboardLayout
      dashboardType="staff"
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

export default StaffDashboard;
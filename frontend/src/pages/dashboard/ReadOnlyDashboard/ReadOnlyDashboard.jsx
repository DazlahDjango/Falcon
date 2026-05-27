// frontend/src/pages/dashboard/ReadOnlyDashboard/ReadOnlyDashboard.jsx

import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { useReadOnlyDashboard } from '../../../hooks/dashboard/useReadOnlyDashboard';

const ReadOnlyDashboard = () => {
  const [currentView, setCurrentView] = useState('executive');
  
  const {
    dashboardData,
    period,
    viewType,
    loading,
    refreshDashboard,
    setPeriod,
    setViewType
  } = useReadOnlyDashboard({ autoFetch: true });
  // Hook handles all data fetching with autoFetch:true

  // Different widgets based on view type
  const getWidgets = () => {
    if (viewType === 'executive') {
      return [
        {
          id: 'overview',
          widget_type: 'executive_scorecard',
          title: 'Executive Scorecard (Read-Only)',
          row: 0,
          col: 0,
          width: 6,
          height: 4,
          data: dashboardData?.data,
          loading: loading,
          readOnly: true
        },
        {
          id: 'departments',
          widget_type: 'department_heatmap',
          title: 'Department Performance',
          row: 0,
          col: 6,
          width: 6,
          height: 4,
          data: dashboardData?.data?.departments,
          loading: loading,
          readOnly: true
        },
        {
          id: 'trends',
          widget_type: 'trend_chart',
          title: 'Performance Trends',
          row: 4,
          col: 0,
          width: 8,
          height: 3,
          data: dashboardData?.data?.trends,
          loading: loading,
          readOnly: true
        },
        {
          id: 'alerts',
          widget_type: 'red_alert',
          title: 'Critical Alerts',
          row: 4,
          col: 8,
          width: 4,
          height: 3,
          data: dashboardData?.data?.alerts,
          loading: loading,
          readOnly: true
        }
      ];
    } else if (viewType === 'manager') {
      return [
        {
          id: 'team_performance',
          widget_type: 'team_performance',
          title: 'Team Performance (Read-Only)',
          row: 0,
          col: 0,
          width: 6,
          height: 4,
          data: dashboardData?.data,
          loading: loading,
          readOnly: true
        },
        {
          id: 'team_members',
          widget_type: 'team_list',
          title: 'Team Members',
          row: 0,
          col: 6,
          width: 6,
          height: 4,
          data: dashboardData?.data?.team_members,
          loading: loading,
          readOnly: true
        }
      ];
    } else {
      return [
        {
          id: 'my_kpis',
          widget_type: 'kpi_list',
          title: 'My KPIs (Read-Only)',
          row: 0,
          col: 0,
          width: 6,
          height: 4,
          data: dashboardData?.data?.kpis,
          loading: loading,
          readOnly: true
        },
        {
          id: 'mission_status',
          widget_type: 'mission_status',
          title: 'Mission Status Report',
          row: 0,
          col: 6,
          width: 6,
          height: 4,
          data: dashboardData?.data?.mission_status,
          loading: loading,
          readOnly: true
        }
      ];
    }
  };

  const layout = {
    columns: 12,
    cellHeight: 100,
    margin: 10
  };

  const handleSaveLayout = async (newLayout) => {
    // Read-only mode - no saving
    console.log('Read-only: layout cannot be saved');
  };

  const handleAddWidget = async (widgetData) => {
    // Read-only mode - no adding
    console.log('Read-only: widgets cannot be added');
  };

  const handleUpdateWidget = async (widgetId, widgetData) => {
    // Read-only mode - no updating
    console.log('Read-only: widgets cannot be updated');
  };

  const handleRemoveWidget = async (widgetId) => {
    // Read-only mode - no removing
    console.log('Read-only: widgets cannot be removed');
  };

  return (
    <DashboardLayout
      dashboardType="read_only"
      widgets={getWidgets()}
      layout={layout}
      onSaveLayout={handleSaveLayout}
      onAddWidget={handleAddWidget}
      onUpdateWidget={handleUpdateWidget}
      onRemoveWidget={handleRemoveWidget}
      onRefresh={refreshDashboard}
      loading={loading}
      readOnly={true}
    />
  );
};

export default ReadOnlyDashboard;
import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { ExecutiveOverview } from './ExecutiveOverview';
import { ExecutiveDepartments } from './ExecutiveDepartments';
import { ExecutiveTrends } from './ExecutiveTrends';
import { ExecutiveAlerts } from './ExecutiveAlerts';
import { useExecutiveDashboard } from '../../../hooks/dashboard/useExecutiveDashboard';

const ExecutiveDashboard = () => {
  const {
    dashboardData,
    departments,
    trends,
    issues,
    loading,
    refreshDashboard,
    fetchDepartments,
    fetchTrends,
    fetchIssues
  } = useExecutiveDashboard({ autoRefresh: true, refreshInterval: 60000 });
  // Hook handles all data fetching with autoRefresh:true

  const widgets = [
    {
      id: 'overview',
      widget_type: 'executive_scorecard',
      title: 'Executive Scorecard',
      row: 0,
      col: 0,
      width: 6,
      height: 4,
      data: dashboardData,
      loading: loading,
      onRefresh: refreshDashboard
    },
    {
      id: 'departments',
      widget_type: 'department_heatmap',
      title: 'Department Performance',
      row: 0,
      col: 6,
      width: 6,
      height: 4,
      data: departments,
      loading: loading,
      onRefresh: fetchDepartments
    },
    {
      id: 'trends',
      widget_type: 'trend_chart',
      title: 'Performance Trends',
      row: 4,
      col: 0,
      width: 8,
      height: 3,
      data: trends,
      loading: loading,
      onRefresh: fetchTrends
    },
    {
      id: 'alerts',
      widget_type: 'red_alert',
      title: 'Critical Alerts',
      row: 4,
      col: 8,
      width: 4,
      height: 3,
      data: issues,
      loading: loading,
      onRefresh: fetchIssues
    }
  ];

  const layout = {
    columns: 12,
    cellHeight: 100,
    margin: 10
  };

  const handleSaveLayout = async (newLayout) => {
    // Save layout configuration to backend
    console.log('Saving layout:', newLayout);
  };

  const handleAddWidget = async (widgetData) => {
    console.log('Adding widget:', widgetData);
  };

  const handleUpdateWidget = async (widgetId, widgetData) => {
    console.log('Updating widget:', widgetId, widgetData);
  };

  const handleRemoveWidget = async (widgetId) => {
    console.log('Removing widget:', widgetId);
  };

  return (
    <DashboardLayout
      dashboardType="executive"
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

export default ExecutiveDashboard;
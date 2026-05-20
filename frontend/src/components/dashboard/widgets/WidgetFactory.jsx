import React from 'react';
import PropTypes from 'prop-types';
import { WIDGET_TYPES } from '../../../config/constants/dashboardConstants';
import { KPITableWidget } from './KPITableWidget';
import { TrendChartWidget } from './TrendChartWidget';
import { DepartmentHeatmapWidget } from './DepartmentHeatmapWidget';
import { ComplianceWidget } from './ComplianceWidget';
import { RedAlertWidget } from './RedAlertWidget';
import { PendingApprovalsWidget } from './PendingApprovalsWidget';
import { MissingDataWidget } from './MissingDataWidget';
import { TenantSummaryWidget } from './TenantSummaryWidget';

const widgetComponents = {
  [WIDGET_TYPES.KPI_LIST]: KPITableWidget,
  [WIDGET_TYPES.TREND_CHART]: TrendChartWidget,
  [WIDGET_TYPES.DEPARTMENT_HEATMAP]: DepartmentHeatmapWidget,
  [WIDGET_TYPES.COMPLIANCE]: ComplianceWidget,
  [WIDGET_TYPES.RED_ALERT]: RedAlertWidget,
  [WIDGET_TYPES.PENDING_APPROVALS]: PendingApprovalsWidget,
  [WIDGET_TYPES.MISSING_DATA]: MissingDataWidget,
  [WIDGET_TYPES.TENANT_SUMMARY]: TenantSummaryWidget,
};

export const WidgetFactory = ({ type, props }) => {
  const WidgetComponent = widgetComponents[type];
  
  if (!WidgetComponent) {
    console.warn(`Unknown widget type: ${type}`);
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        ⚠️ Widget type "{type}" not found
      </div>
    );
  }
  
  return <WidgetComponent {...props} />;
};

WidgetFactory.propTypes = {
  type: PropTypes.string.isRequired,
  props: PropTypes.object
};
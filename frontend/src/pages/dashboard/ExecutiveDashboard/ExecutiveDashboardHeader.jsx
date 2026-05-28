import React from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker, RefreshButton, ExportButton } from '../../../components/dashboard/common';

export const ExecutiveDashboardHeader = ({
  title = 'Executive Dashboard',
  onRefresh,
  onExport,
  onDateRangeChange,
  lastUpdated,
  isLoading
}) => {
  return (
    <div className="executive-dashboard-header">
      <div className="header-left">
        <h1 className="dashboard-title">{title}</h1>
        <div className="dashboard-description">
          Organization-wide performance overview
        </div>
      </div>

      <div className="header-right">
        <DateRangePicker
          onChange={onDateRangeChange}
          presets={true}
        />
        <RefreshButton
          onRefresh={onRefresh}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />
        <ExportButton
          onExport={onExport}
          formats={['pdf', 'excel', 'csv']}
        />
      </div>
    </div>
  );
};

ExecutiveDashboardHeader.propTypes = {
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onDateRangeChange: PropTypes.func,
  lastUpdated: PropTypes.string,
  isLoading: PropTypes.bool
};

export default ExecutiveDashboardHeader;
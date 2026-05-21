// frontend/src/pages/dashboard/StaffDashboard/StaffDashboardHeader.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { DateRangePicker, RefreshButton, ExportButton, FilterBar } from '../../../components/dashboard/common';

export const StaffDashboardHeader = ({ 
  period, 
  setPeriod, 
  onRefresh, 
  onExport,
  loading 
}) => {
  const user = useSelector((state) => state.auth?.user);

  const periodOptions = [
    { value: 'current', label: 'Current Period' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const filters = [
    {
      id: 'kpi_status',
      type: 'select',
      label: 'KPI Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'green', label: 'On Track' },
        { value: 'yellow', label: 'At Risk' },
        { value: 'red', label: 'Off Track' }
      ]
    },
    {
      id: 'submission_status',
      type: 'select',
      label: 'Submission Status',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    }
  ];

  return (
    <div className="dashboard-header staff-header">
      <div className="header-left">
        <h1 className="dashboard-title">My Dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.first_name || user?.username}
        </p>
      </div>
      
      <div className="header-right">
        <div className="period-selector">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
            disabled={loading}
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <RefreshButton onRefresh={onRefresh} loading={loading} />
        <ExportButton onExport={onExport} loading={loading} />
      </div>
      
      <FilterBar filters={filters} className="staff-filters" />
    </div>
  );
};

export default StaffDashboardHeader;
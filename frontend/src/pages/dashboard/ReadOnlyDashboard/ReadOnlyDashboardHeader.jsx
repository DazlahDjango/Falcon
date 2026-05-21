// frontend/src/pages/dashboard/ReadOnlyDashboard/ReadOnlyDashboardHeader.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { RefreshButton, ExportButton, FilterBar } from '../../../components/dashboard/common';

export const ReadOnlyDashboardHeader = ({ 
  period, 
  setPeriod, 
  viewType,
  setViewType,
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

  const viewOptions = [
    { value: 'executive', label: 'Executive View' },
    { value: 'manager', label: 'Manager View' },
    { value: 'staff', label: 'Staff View' }
  ];

  return (
    <div className="dashboard-header readonly-header">
      <div className="header-left">
        <h1 className="dashboard-title">Read-Only Dashboard</h1>
        <p className="dashboard-subtitle">
          View-only access for {user?.first_name || user?.username}
        </p>
      </div>
      
      <div className="header-right">
        <div className="view-selector">
          <select 
            value={viewType} 
            onChange={(e) => setViewType(e.target.value)}
            className="view-select"
            disabled={loading}
          >
            {viewOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
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
      
      <div className="readonly-banner">
        <span className="banner-icon">🔒</span>
        <span>You are in read-only mode. You can view data but cannot make changes.</span>
      </div>
    </div>
  );
};

export default ReadOnlyDashboardHeader;
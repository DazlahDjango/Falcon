// frontend/src/pages/dashboard/ManagerDashboard/ManagerDashboardHeader.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { DateRangePicker, RefreshButton, ExportButton, FilterBar } from '../../../components/dashboard/common';

export const ManagerDashboardHeader = ({ 
  period, 
  setPeriod, 
  includeTeam, 
  setIncludeTeam,
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
      id: 'includeTeam',
      type: 'toggle',
      label: 'Include Team',
      value: includeTeam,
      onChange: setIncludeTeam
    },
    {
      id: 'department',
      type: 'select',
      label: 'Department',
      options: [
        { value: '', label: 'All Departments' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'engineering', label: 'Engineering' }
      ]
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'green', label: 'On Track' },
        { value: 'yellow', label: 'At Risk' },
        { value: 'red', label: 'Off Track' }
      ]
    }
  ];

  return (
    <div className="dashboard-header manager-header">
      <div className="header-left">
        <h1 className="dashboard-title">Manager Dashboard</h1>
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
        
        <div className="team-toggle">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={includeTeam}
              onChange={(e) => setIncludeTeam(e.target.checked)}
              disabled={loading}
            />
            <span>Include Team</span>
          </label>
        </div>
        
        <RefreshButton onRefresh={onRefresh} loading={loading} />
        <ExportButton onExport={onExport} loading={loading} />
      </div>
      
      <FilterBar filters={filters} className="manager-filters" />
    </div>
  );
};

export default ManagerDashboardHeader;
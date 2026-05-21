// frontend/src/pages/dashboard/ChampionDashboard/ChampionDashboardHeader.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { RefreshButton, ExportButton, FilterBar } from '../../../components/dashboard/common';

export const ChampionDashboardHeader = ({ 
  targetUserId,
  setTargetUserId,
  period,
  setPeriod,
  onRefresh,
  onExport,
  loading,
  users
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
      id: 'category',
      type: 'select',
      label: 'KPI Category',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'sales', label: 'Sales' },
        { value: 'finance', label: 'Finance' },
        { value: 'hr', label: 'HR' },
        { value: 'operations', label: 'Operations' }
      ]
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  return (
    <div className="dashboard-header champion-header">
      <div className="header-left">
        <h1 className="dashboard-title">Champion Dashboard</h1>
        <p className="dashboard-subtitle">
          Configure and manage dashboards
        </p>
      </div>
      
      <div className="header-right">
        <div className="user-selector">
          <select 
            value={targetUserId || ''}
            onChange={(e) => setTargetUserId(e.target.value || null)}
            className="user-select"
            disabled={loading}
          >
            <option value="">Select User (optional)</option>
            {users?.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
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
      
      <FilterBar filters={filters} className="champion-filters" />
      
      <div className="champion-info">
        <div className="info-badge">
          <span className="badge-icon">✏️</span>
          Edit Mode Active
        </div>
        <div className="info-text">
          You can add, remove, and configure KPIs for any user
        </div>
      </div>
    </div>
  );
};

export default ChampionDashboardHeader;
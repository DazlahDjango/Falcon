// frontend/src/pages/dashboard/ChampionDashboard/BulkAssignPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const BulkAssignPanel = ({ users, availableKPIs, loading, onRefresh, onBulkAssign, targetUser }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [defaultWeight, setDefaultWeight] = useState(1);

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleKPISelect = (kpiId) => {
    setSelectedKPIs(prev =>
      prev.includes(kpiId)
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users?.map(u => u.id) || []);
    }
  };

  const handleSelectAllKPIs = () => {
    if (selectedKPIs.length === availableKPIs?.length) {
      setSelectedKPIs([]);
    } else {
      setSelectedKPIs(availableKPIs?.map(k => k.id) || []);
    }
  };

  const handleSubmit = () => {
    if (selectedUsers.length > 0 && selectedKPIs.length > 0) {
      onBulkAssign?.({
        userIds: selectedUsers,
        kpiIds: selectedKPIs,
        weight: defaultWeight
      });
    }
  };

  return (
    <DashboardCard 
      title="Bulk Assign KPIs"
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="bulk-assign-layout">
        {/* Users Column */}
        <div className="users-selection">
          <div className="selection-header">
            <h4>Select Users</h4>
            <button className="select-all-btn" onClick={handleSelectAllUsers}>
              {selectedUsers.length === users?.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="users-list">
            {users?.map(user => (
              <label key={user.id} className="user-checkbox">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelect(user.id)}
                />
                <span>{user.name} ({user.role})</span>
              </label>
            ))}
            {(!users || users.length === 0) && (
              <div className="empty-message">No users found</div>
            )}
          </div>
        </div>
        
        {/* KPIs Column */}
        <div className="kpis-selection">
          <div className="selection-header">
            <h4>Select KPIs to Assign</h4>
            <button className="select-all-btn" onClick={handleSelectAllKPIs}>
              {selectedKPIs.length === availableKPIs?.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="kpis-list">
            {availableKPIs?.map(kpi => (
              <label key={kpi.id} className="kpi-checkbox">
                <input
                  type="checkbox"
                  checked={selectedKPIs.includes(kpi.id)}
                  onChange={() => handleKPISelect(kpi.id)}
                />
                <span>{kpi.name}</span>
                <span className="kpi-target">(Target: {kpi.target})</span>
              </label>
            ))}
            {(!availableKPIs || availableKPIs.length === 0) && (
              <div className="empty-message">No KPIs available</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bulk-settings">
        <label>
          Default Weight:
          <input
            type="number"
            value={defaultWeight}
            onChange={(e) => setDefaultWeight(parseInt(e.target.value))}
            min="1"
            max="100"
          />
        </label>
        
        <div className="bulk-summary">
          Assigning {selectedKPIs.length} KPI(s) to {selectedUsers.length} user(s)
        </div>
        
        <button 
          className="bulk-assign-btn"
          onClick={handleSubmit}
          disabled={selectedUsers.length === 0 || selectedKPIs.length === 0}
        >
          Assign to Selected Users
        </button>
      </div>
    </DashboardCard>
  );
};

export default BulkAssignPanel;
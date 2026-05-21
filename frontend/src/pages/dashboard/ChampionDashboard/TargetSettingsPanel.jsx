// frontend/src/pages/dashboard/ChampionDashboard/TargetSettingsPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const TargetSettingsPanel = ({ assignedKPIs, loading, onRefresh, onUpdateTarget, targetUser }) => {
  const [editingTarget, setEditingTarget] = useState(null);
  const [targetValue, setTargetValue] = useState('');

  const handleUpdateTarget = (kpi) => {
    if (targetValue) {
      onUpdateTarget?.(kpi.id, parseFloat(targetValue));
      setEditingTarget(null);
      setTargetValue('');
    }
  };

  return (
    <DashboardCard 
      title={`Target Settings${targetUser ? ` for ${targetUser.name}` : ''}`}
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="target-settings-list">
        {assignedKPIs?.map(kpi => (
          <div key={kpi.id} className="target-setting-item">
            <div className="target-info">
              <div className="kpi-name">{kpi.name}</div>
              <div className="current-target">
                Current Target: {kpi.target}
              </div>
            </div>
            
            {editingTarget === kpi.id ? (
              <div className="target-edit">
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="New target value"
                  step="0.01"
                />
                <button onClick={() => handleUpdateTarget(kpi)}>Save</button>
                <button onClick={() => setEditingTarget(null)}>Cancel</button>
              </div>
            ) : (
              <button 
                className="edit-target-btn"
                onClick={() => {
                  setEditingTarget(kpi.id);
                  setTargetValue(kpi.target?.toString() || '');
                }}
              >
                ✏️ Edit Target
              </button>
            )}
          </div>
        ))}
        
        {(!assignedKPIs || assignedKPIs.length === 0) && (
          <div className="empty-message">No KPIs assigned to configure targets</div>
        )}
      </div>
    </DashboardCard>
  );
};

export default TargetSettingsPanel;
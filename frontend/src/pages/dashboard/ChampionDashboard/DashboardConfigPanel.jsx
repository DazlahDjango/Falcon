// frontend/src/pages/dashboard/ChampionDashboard/DashboardConfigPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const DashboardConfigPanel = ({ data, loading, onRefresh, onSave, targetUser }) => {
  const [config, setConfig] = useState({
    layout: data?.dashboard_config?.layout || {},
    filters: data?.dashboard_config?.filters || {},
    widgets: data?.dashboard_config?.widgets || []
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave?.(config);
    setIsEditing(false);
  };

  return (
    <DashboardCard 
      title={`Dashboard Configuration${targetUser ? ` for ${targetUser.name}` : ''}`}
      loading={loading}
      onRefresh={onRefresh}
      action={
        <button className="config-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : '⚙️ Configure'}
        </button>
      }
    >
      {isEditing ? (
        <div className="config-form">
          <div className="form-section">
            <label>Layout Configuration</label>
            <textarea
              value={JSON.stringify(config.layout, null, 2)}
              onChange={(e) => setConfig({ ...config, layout: JSON.parse(e.target.value || '{}') })}
              rows={5}
              className="code-editor"
            />
          </div>
          
          <div className="form-section">
            <label>Default Filters</label>
            <textarea
              value={JSON.stringify(config.filters, null, 2)}
              onChange={(e) => setConfig({ ...config, filters: JSON.parse(e.target.value || '{}') })}
              rows={3}
              className="code-editor"
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleSave}>Save Configuration</button>
          </div>
        </div>
      ) : (
        <div className="config-view">
          <div className="config-summary">
            <div className="summary-item">
              <span className="summary-label">Widgets:</span>
              <span className="summary-value">{config.widgets.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Layout Columns:</span>
              <span className="summary-value">{config.layout.columns || 12}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Default Period:</span>
              <span className="summary-value">{config.filters.period || 'monthly'}</span>
            </div>
          </div>
          
          <details className="config-details">
            <summary>View Full Configuration</summary>
            <pre className="config-json">
              {JSON.stringify(config, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </DashboardCard>
  );
};

export default DashboardConfigPanel;
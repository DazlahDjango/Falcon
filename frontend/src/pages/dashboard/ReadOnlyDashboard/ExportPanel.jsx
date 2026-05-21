// frontend/src/pages/dashboard/ReadOnlyDashboard/ExportPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const ExportPanel = ({ onExport, loading }) => {
  const [format, setFormat] = useState('pdf');
  const [includeData, setIncludeData] = useState({
    kpis: true,
    charts: true,
    comments: false
  });

  const formats = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
    { value: 'csv', label: 'CSV File', icon: '📈' }
  ];

  const handleExport = () => {
    onExport?.(format, includeData);
  };

  return (
    <DashboardCard title="Export Dashboard">
      <div className="export-options">
        <div className="format-section">
          <h4>Export Format</h4>
          <div className="format-buttons">
            {formats.map(f => (
              <button
                key={f.value}
                className={`format-btn ${format === f.value ? 'active' : ''}`}
                onClick={() => setFormat(f.value)}
              >
                <span className="format-icon">{f.icon}</span>
                <span className="format-label">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="data-section">
          <h4>Include Data</h4>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeData.kpis}
              onChange={(e) => setIncludeData({ ...includeData, kpis: e.target.checked })}
            />
            <span>KPI Data</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeData.charts}
              onChange={(e) => setIncludeData({ ...includeData, charts: e.target.checked })}
            />
            <span>Charts & Visualizations</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeData.comments}
              onChange={(e) => setIncludeData({ ...includeData, comments: e.target.checked })}
            />
            <span>Comments & Notes</span>
          </label>
        </div>
        
        <button 
          className="export-submit-btn"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
        </button>
      </div>
    </DashboardCard>
  );
};

export default ExportPanel;
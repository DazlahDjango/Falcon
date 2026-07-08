import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiFile,
  FiImage,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { useOrgChart } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './orgchart.css';

export const OrgChartExport = () => {
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState('json');
  const [exportEntity, setExportEntity] = useState('departments');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [error, setError] = useState(null);

  const { exportJson, exportCsv, clearError } = useOrgChart({ autoFetch: false });

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.ORG_CHARTS);
  }, [navigate]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const params = {
        format: exportFormat === 'csv' ? 'flat' : 'full',
        include_inactive: includeInactive,
      };

      let response;
      if (exportFormat === 'json') {
        response = await exportJson(params);
      } else {
        response = await exportCsv(params);
      }

      const data = response.data || response;

      if (exportFormat === 'csv' && data instanceof Blob) {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `org_chart_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setExportResult({ success: true, message: 'CSV exported successfully' });
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `org_chart_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setExportResult({ success: true, message: 'JSON exported successfully' });
      }

      setTimeout(() => setExportResult(null), 5000);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportEntity, includeInactive, exportJson, exportCsv]);

  const handleDownloadSample = useCallback(() => {
    const sampleData = {
      departments: [
        { code: 'DEPT-001', name: 'Sample Department', description: 'Sample description' },
      ],
      divisions: [
        { code: 'DIV-001', name: 'Sample Division', description: 'Sample description' },
      ],
    };
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_org_chart.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FiFileText },
    { value: 'csv', label: 'CSV', icon: FiFile },
  ];

  const entityOptions = [
    { value: 'departments', label: 'Departments' },
    { value: 'divisions', label: 'Divisions' },
    { value: 'employments', label: 'Employments' },
    { value: 'positions', label: 'Positions' },
    { value: 'reporting', label: 'Reporting Lines' },
  ];

  if (exporting) {
    return (
      <div className="orgchart-export-loading">
        <StructureLoading text={`Exporting ${exportFormat.toUpperCase()}...`} />
      </div>
    );
  }

  return (
    <div className="orgchart-export-container">
      <div className="orgchart-export-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Export Organizational Chart</h1>
      </div>

      <div className="orgchart-export-body">
        <div className="export-card">
          <h3>Export Settings</h3>

          <div className="export-form-group">
            <label>Export Format</label>
            <div className="format-options">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    className={`format-btn ${exportFormat === option.value ? 'active' : ''}`}
                    onClick={() => setExportFormat(option.value)}
                  >
                    <Icon size={18} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="export-form-group">
            <label>Entity Type</label>
            <select
              value={exportEntity}
              onChange={(e) => setExportEntity(e.target.value)}
              className="entity-select"
            >
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="export-form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              <span>Include Inactive Items</span>
            </label>
          </div>

          {exportFormat === 'json' && (
            <div className="export-info-box">
              <FiCheck size={16} />
              <span>JSON export includes full organizational hierarchy with all relations</span>
            </div>
          )}

          {exportFormat === 'csv' && (
            <div className="export-info-box">
              <FiCheck size={16} />
              <span>CSV export provides flat structure suitable for spreadsheet applications</span>
            </div>
          )}

          {error && (
            <div className="export-error-box">
              <FiAlertCircle size={16} />
              <span>{error}</span>
              <button onClick={() => { clearError(); setError(null); }} className="btn btn-secondary">
                Dismiss
              </button>
            </div>
          )}

          {exportResult && (
            <div className="export-success-box">
              <FiCheck size={16} />
              <span>{exportResult.message}</span>
            </div>
          )}

          <div className="export-actions">
            <button onClick={handleExport} className="btn btn-primary">
              <FiDownload size={16} />
              Export {exportFormat.toUpperCase()}
            </button>
            <button onClick={handleDownloadSample} className="btn btn-secondary">
              <FiFileText size={16} />
              Download Sample
            </button>
          </div>
        </div>

        <div className="export-info-card">
          <h4>About Export</h4>
          <ul className="export-info-list">
            <li>
              <strong>JSON:</strong> Full hierarchical structure with all fields. Ideal for system integration and data backup.
            </li>
            <li>
              <strong>CSV:</strong> Flat structure with key fields. Perfect for spreadsheet analysis and reporting.
            </li>
            <li>
              <strong>Include Inactive:</strong> Toggle to include or exclude inactive departments, divisions, and employments.
            </li>
          </ul>

          <div className="export-stats">
            <h4>Quick Stats</h4>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Departments</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Divisions</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Employments</span>
                <span className="stat-value">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChartExport;
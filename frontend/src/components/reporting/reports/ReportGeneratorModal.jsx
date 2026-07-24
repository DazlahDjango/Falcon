import React, { useState } from 'react';
import { EXPORT_FORMATS, EXPORT_FORMAT_DISPLAY } from '../../../config/constants';

export const ReportGeneratorModal = ({ isOpen, onClose, template, onSubmit }) => {
  const [format, setFormat] = useState(EXPORT_FORMATS.PDF);
  const [title, setTitle] = useState('');
  const [asyncMode, setAsyncMode] = useState(true);

  if (!isOpen || !template) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reportType: template.code || template.report_type,
      format,
      title: title || template.name,
      asyncMode,
      filters: {}
    });
    onClose();
  };

  return (
    <div className="reporting-modal-overlay">
      <div className="reporting-modal-content">
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#f8fafc' }}>
          Generate Report: {template.name}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
              Report Custom Title
            </label>
            <input
              type="text"
              placeholder={template.name}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            >
              {Object.entries(EXPORT_FORMAT_DISPLAY).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="asyncMode"
              checked={asyncMode}
              onChange={(e) => setAsyncMode(e.target.checked)}
            />
            <label htmlFor="asyncMode" style={{ fontSize: 14, color: '#e2e8f0', cursor: 'pointer' }}>
              Run asynchronously in background (recommended for large reports)
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="reporting-btn reporting-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="reporting-btn reporting-btn-primary">
              Start Generation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;

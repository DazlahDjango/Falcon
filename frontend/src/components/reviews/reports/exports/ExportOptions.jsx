// src/components/reviews/reports/exports/ExportOptions.jsx
import React from 'react';
import { FileText, FileSpreadsheet, File, Calendar, Users, TrendingUp } from 'lucide-react';

const ExportOptions = ({
  selectedReport,
  selectedCycle,
  format,
  onReportChange,
  onCycleChange,
  onFormatChange,
}) => {
  const reportTypes = [
    { value: 'cycle', label: 'Cycle Report', icon: <Calendar size={16} /> },
    { value: 'team', label: 'Team Report', icon: <Users size={16} /> },
    { value: 'employee', label: 'Employee Report', icon: <Users size={16} /> },
    { value: 'pip', label: 'PIP Report', icon: <TrendingUp size={16} /> },
    { value: 'calibration', label: 'Calibration Report', icon: <TrendingUp size={16} /> },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF', icon: <FileText size={16} /> },
    { value: 'excel', label: 'Excel', icon: <FileSpreadsheet size={16} /> },
    { value: 'csv', label: 'CSV', icon: <File size={16} /> },
  ];

  // Mock cycles - would come from API
  const cycles = [
    { id: '1', name: 'Q1 2024 Review' },
    { id: '2', name: 'Q2 2024 Review' },
    { id: '3', name: 'Annual Review 2024' },
  ];

  return (
    <div className="export-options">
      <div className="export-options-group">
        <label className="export-options-label">Report Type</label>
        <div className="export-options-grid">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              className={`export-options-btn ${selectedReport === type.value ? 'active' : ''}`}
              onClick={() => onReportChange(type.value)}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="export-options-group">
        <label className="export-options-label">Review Cycle</label>
        <select
          className="export-options-select"
          value={selectedCycle}
          onChange={(e) => onCycleChange(e.target.value)}
        >
          <option value="">Select cycle...</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
            </option>
          ))}
        </select>
      </div>

      <div className="export-options-group">
        <label className="export-options-label">Export Format</label>
        <div className="export-options-formats">
          {formats.map((fmt) => (
            <button
              key={fmt.value}
              className={`export-options-format-btn ${format === fmt.value ? 'active' : ''}`}
              onClick={() => onFormatChange(fmt.value)}
            >
              {fmt.icon}
              {fmt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;
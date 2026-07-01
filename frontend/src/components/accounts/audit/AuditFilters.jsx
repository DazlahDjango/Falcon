import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

export const AuditFilters = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset = {
      action: '',
      action_type: '',
      severity: '',
      user: '',
      start_date: '',
      end_date: '',
    };
    setLocalFilters(reset);
    onFilterChange(reset);
    onClose();
  };

  return (
    <div className="audit-filters-panel">
      <div className="filters-header">
        <span className="filters-title">Filter Audit Logs</span>
        <button className="filters-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">Severity</label>
          <select
            className="filter-select"
            value={localFilters.severity || ''}
            onChange={(e) => handleChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Action Type</label>
          <select
            className="filter-select"
            value={localFilters.action_type || ''}
            onChange={(e) => handleChange('action_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Action</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by action..."
            value={localFilters.action || ''}
            onChange={(e) => handleChange('action', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">User</label>
          <input
            type="text"
            className="filter-input"
            placeholder="User email..."
            value={localFilters.user || ''}
            onChange={(e) => handleChange('user', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            className="filter-input"
            value={localFilters.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            className="filter-input"
            value={localFilters.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>
      </div>

      <div className="filters-actions">
        <button className="btn-secondary" onClick={handleReset}>
          Reset
        </button>
        <button className="btn-primary" onClick={handleApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};
export default AuditFilters;
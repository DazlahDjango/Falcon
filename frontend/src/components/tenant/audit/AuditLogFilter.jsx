// frontend/src/components/tenant/audit/AuditLogFilter.jsx
import React, { useState } from 'react';
import './audit.css';

export const AuditLogFilter = ({ filters, onFilterChange, onReset, onExport }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const handleChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDateChange = (field, value) => {
        const newDateRange = { ...dateRange, [field]: value };
        setDateRange(newDateRange);
        if (value) {
            handleChange(field === 'start' ? 'start_date' : 'end_date', value);
        }
    };

    const handleReset = () => {
        setLocalFilters({});
        setDateRange({ start: '', end: '' });
        onReset();
    };

    const handleExport = () => {
        if (onExport) onExport();
    };

    return (
        <div className="audit-filter-bar">
            <div className="audit-filter-group">
                <label className="audit-filter-label">Action</label>
                <select
                    value={localFilters.action || ''}
                    onChange={(e) => handleChange('action', e.target.value)}
                    className="audit-filter-select"
                >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="suspend">Suspend</option>
                    <option value="activate">Activate</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                </select>
            </div>

            <div className="audit-filter-group">
                <label className="audit-filter-label">User</label>
                <input
                    type="text"
                    placeholder="User email or ID"
                    value={localFilters.user_id || ''}
                    onChange={(e) => handleChange('user_id', e.target.value)}
                    className="audit-filter-input"
                />
            </div>

            <div className="audit-filter-group">
                <label className="audit-filter-label">Resource</label>
                <input
                    type="text"
                    placeholder="Resource type"
                    value={localFilters.resource_type || ''}
                    onChange={(e) => handleChange('resource_type', e.target.value)}
                    className="audit-filter-input"
                />
            </div>

            <div className="audit-filter-group">
                <label className="audit-filter-label">Start Date</label>
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="audit-filter-input"
                />
            </div>

            <div className="audit-filter-group">
                <label className="audit-filter-label">End Date</label>
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="audit-filter-input"
                />
            </div>

            <div className="audit-filter-actions">
                <button onClick={handleReset} className="audit-filter-btn audit-filter-btn-secondary">
                    Reset
                </button>
                <button onClick={handleExport} className="audit-filter-btn audit-filter-btn-primary">
                    Export
                </button>
            </div>
        </div>
    );
};
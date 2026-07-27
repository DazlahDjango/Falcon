// frontend/src/components/reports/audits/AuditFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './audits.css';

export const AuditFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const actions = [
        { value: '', label: 'All Actions' },
        { value: 'view', label: 'View' },
        { value: 'create', label: 'Create' },
        { value: 'edit', label: 'Edit' },
        { value: 'delete', label: 'Delete' },
        { value: 'export', label: 'Export' },
        { value: 'share', label: 'Share' },
        { value: 'schedule', label: 'Schedule' },
        { value: 'generate', label: 'Generate' },
        { value: 'refresh', label: 'Refresh' },
        { value: 'archive', label: 'Archive' },
        { value: 'restore', label: 'Restore' },
        { value: 'permission_change', label: 'Permission Change' },
        { value: 'config_change', label: 'Configuration Change' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`audit-filters ${className}`}>
            <div className="filters-header">
                <span className="filters-title">
                    <FiFilter size={16} />
                    Filters
                </span>
                {hasActiveFilters() && (
                    <button className="filters-clear" onClick={onReset}>
                        <FiX size={14} />
                        Clear All
                    </button>
                )}
            </div>
            <div className="filters-grid">
                <div className="filter-group">
                    <label className="filter-label">Action</label>
                    <select
                        className="filter-select"
                        value={filters.action || ''}
                        onChange={(e) => handleChange('action', e.target.value)}
                    >
                        {actions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Report</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.report || ''}
                        onChange={(e) => handleChange('report', e.target.value)}
                        placeholder="Report ID or name..."
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">User</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.user || ''}
                        onChange={(e) => handleChange('user', e.target.value)}
                        placeholder="User ID or email..."
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        className="filter-select"
                        value={filters.success ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('success', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Success</option>
                        <option value="false">Failed</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">IP Address</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.ip_address || ''}
                        onChange={(e) => handleChange('ip_address', e.target.value)}
                        placeholder="IP address..."
                    />
                </div>
            </div>
        </div>
    );
};

AuditFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};
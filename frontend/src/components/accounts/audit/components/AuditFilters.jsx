// frontend/src/components/accounts/audit/components/AuditFilters.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiCalendar, FiUser, FiShield, FiMapPin } from 'react-icons/fi';

const AuditFilters = ({ filters, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const actionTypes = [
        { value: '', label: 'All Actions' },
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'approve', label: 'Approve' },
        { value: 'reject', label: 'Reject' },
        { value: 'export', label: 'Export' },
        { value: 'view', label: 'View' },
        { value: 'security', label: 'Security' },
    ];

    const severities = [
        { value: '', label: 'All Severities' },
        { value: 'info', label: 'Info', color: '#3b82f6' },
        { value: 'warning', label: 'Warning', color: '#f59e0b' },
        { value: 'error', label: 'Error', color: '#ef4444' },
        { value: 'critical', label: 'Critical', color: '#dc2626' },
    ];

    return (
        <div className="audit-filters-panel">
            <div className="filters-header">
                <div className="filters-title">
                    <FiSearch size={16} />
                    <h3>Advanced Filters</h3>
                </div>
                <button className="reset-filters" onClick={onReset}>
                    <FiX size={14} />
                    Reset All
                </button>
            </div>

            <div className="filters-grid">
                <div className="filter-group">
                    <label>
                        <FiCalendar size={12} />
                        Date Range
                    </label>
                    <div className="date-range">
                        <input
                            type="date"
                            value={localFilters.start_date || ''}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            placeholder="Start Date"
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            value={localFilters.end_date || ''}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            placeholder="End Date"
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>
                        <FiShield size={12} />
                        Action Type
                    </label>
                    <select
                        value={localFilters.action_type || ''}
                        onChange={(e) => handleChange('action_type', e.target.value)}
                    >
                        {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>
                        <FiAlertCircle size={12} />
                        Severity
                    </label>
                    <select
                        value={localFilters.severity || ''}
                        onChange={(e) => handleChange('severity', e.target.value)}
                    >
                        {severities.map(sev => (
                            <option key={sev.value} value={sev.value}>
                                {sev.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>
                        <FiUser size={12} />
                        User Email
                    </label>
                    <input
                        type="text"
                        placeholder="Search by user email..."
                        value={localFilters.user_email || ''}
                        onChange={(e) => handleChange('user_email', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>
                        <FiMapPin size={12} />
                        IP Address
                    </label>
                    <input
                        type="text"
                        placeholder="Filter by IP address..."
                        value={localFilters.ip_address || ''}
                        onChange={(e) => handleChange('ip_address', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Action Name</label>
                    <input
                        type="text"
                        placeholder="Search by action name..."
                        value={localFilters.action || ''}
                        onChange={(e) => handleChange('action', e.target.value)}
                    />
                </div>
            </div>

            <div className="filters-footer">
                <div className="active-filters">
                    {Object.entries(localFilters).filter(([_, v]) => v && v !== '').length} active filter(s)
                </div>
            </div>
        </div>
    );
};

export default AuditFilters;
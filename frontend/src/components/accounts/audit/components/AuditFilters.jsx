import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const AuditFilters = ({ filters, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };
    const actionTypes = [
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'approve', label: 'Approve' },
        { value: 'reject', label: 'Reject' },
        { value: 'export', label: 'Export' },
        { value: 'view', label: 'View' }
    ];
    const severities = [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' },
        { value: 'critical', label: 'Critical' }
    ];
    return (
        <div className="audit-filters-panel">
            <div className="filters-header">
                <h3>Filters</h3>
                <button className="reset-filters" onClick={onReset}>
                    <FiX size={14} />
                    Reset
                </button>
            </div>
            
            <div className="filters-grid">
                <div className="filter-group">
                    <label>Action Type</label>
                    <select
                        value={localFilters.action_type || ''}
                        onChange={(e) => handleChange('action_type', e.target.value)}
                    >
                        <option value="">All</option>
                        {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Severity</label>
                    <select
                        value={localFilters.severity || ''}
                        onChange={(e) => handleChange('severity', e.target.value)}
                    >
                        <option value="">All</option>
                        {severities.map(sev => (
                            <option key={sev.value} value={sev.value}>{sev.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>User</label>
                    <input
                        type="text"
                        placeholder="User email"
                        value={localFilters.user_email || ''}
                        onChange={(e) => handleChange('user_email', e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <label>Start Date</label>
                    <input
                        type="date"
                        value={localFilters.start_date || ''}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <label>End Date</label>
                    <input
                        type="date"
                        value={localFilters.end_date || ''}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <label>IP Address</label>
                    <input
                        type="text"
                        placeholder="IP address"
                        value={localFilters.ip_address || ''}
                        onChange={(e) => handleChange('ip_address', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
export default AuditFilters;
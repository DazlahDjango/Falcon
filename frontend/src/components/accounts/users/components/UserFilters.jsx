// frontend/src/components/accounts/users/components/UserFilters.jsx
import React, { useState } from 'react';
import { FiX, FiFilter } from 'react-icons/fi';

const UserFilters = ({ filters, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="user-filters-panel">
            <div className="filters-header">
                <div className="filters-title">
                    <FiFilter size={16} />
                    <h3>Advanced Filters</h3>
                </div>
                <button className="reset-filters" onClick={onReset}>
                    <FiX size={14} />
                    Reset All
                </button>
            </div>

            <div className="filters-grid">
                <div className="filter-group">
                    <label>Role</label>
                    <select
                        value={localFilters.role || ''}
                        onChange={(e) => handleChange('role', e.target.value || undefined)}
                    >
                        <option value="">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="client_admin">Client Admin</option>
                        <option value="executive">Executive</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="dashboard_champion">Dashboard Champion</option>
                        <option value="staff">Staff</option>
                        <option value="read_only">Read Only</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Account Status</label>
                    <select
                        value={localFilters.is_active !== undefined ? String(localFilters.is_active) : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_active', val === '' ? undefined : val === 'true');
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Email Verification</label>
                    <select
                        value={localFilters.is_verified !== undefined ? String(localFilters.is_verified) : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_verified', val === '' ? undefined : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>MFA Status</label>
                    <select
                        value={localFilters.mfa_enabled !== undefined ? String(localFilters.mfa_enabled) : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('mfa_enabled', val === '' ? undefined : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">MFA Enabled</option>
                        <option value="false">MFA Disabled</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Department</label>
                    <input
                        type="text"
                        value={localFilters.department_id || ''}
                        onChange={(e) => handleChange('department_id', e.target.value || undefined)}
                        placeholder="Filter by department"
                    />
                </div>

                <div className="filter-group">
                    <label>Joined After</label>
                    <input
                        type="date"
                        value={localFilters.joined_after || ''}
                        onChange={(e) => handleChange('joined_after', e.target.value || undefined)}
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

export default UserFilters;
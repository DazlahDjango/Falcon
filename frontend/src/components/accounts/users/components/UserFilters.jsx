import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const UserFilters = ({ filters, onFilterChange, onReset }) => {
    const [localFilters, setLocalFiters] = useState(filters);
    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFiters(newFilters);
        onFilterChange(newFilters);
    };
    return (
        <div className="user-filters-panel">
            <div className="filters-header">
                <h3>Filters</h3>
                <button className="reset-filters" onClick={onReset}>
                    <FiX size={14} />
                    Reset
                </button>
            </div>
            
            <div className="filters-grid">
                <div className="filter-group">
                    <label>Role</label>
                    <select 
                        value={localFilters.role || ''}
                        onChange={(e) => handleChange('role', e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="staff">Staff</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="executive">Executive</option>
                        <option value="client_admin">Admin</option>
                        <option value="read_only">Read Only</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status</label>
                    <select 
                        value={localFilters.is_active !== undefined ? localFilters.is_active : ''}
                        onChange={(e) => handleChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Verification</label>
                    <select 
                        value={localFilters.is_verified !== undefined ? localFilters.is_verified : ''}
                        onChange={(e) => handleChange('is_verified', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                        <option value="">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>MFA Status</label>
                    <select 
                        value={localFilters.mfa_enabled !== undefined ? localFilters.mfa_enabled : ''}
                        onChange={(e) => handleChange('mfa_enabled', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                        <option value="">All</option>
                        <option value="true">MFA Enabled</option>
                        <option value="false">MFA Disabled</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Date Joined</label>
                    <input
                        type="date"
                        value={localFilters.joined_after || ''}
                        onChange={(e) => handleChange('joined_after', e.target.value)}
                        placeholder="After"
                    />
                </div>
            </div>
        </div>
    );
};
export default UserFilters;
import React, { useState } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { USER_ROLES } from '../../../config/constants/accountsApiConstants';

export const UserFilters = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roleOptions = Object.entries(USER_ROLES).map(([key, value]) => ({
    value,
    label: value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      role: '',
      is_active: null,
      is_verified: null,
      department: '',
    });
  };

  const activeFilters = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="user-filters">
      <button className="filter-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FiFilter />
        <span>Filters</span>
        {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span className="filter-title">Filter Users</span>
            <button className="filter-clear" onClick={handleClear}>
              <FiX /> Clear All
            </button>
          </div>

          <div className="filter-group">
            <label className="filter-label">Role</label>
            <select
              className="filter-select"
              value={filters.role || ''}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="filter-options">
              <button
                className={`filter-option ${filters.is_active === null ? 'active' : ''}`}
                onClick={() => handleChange('is_active', null)}
              >
                All
              </button>
              <button
                className={`filter-option ${filters.is_active === true ? 'active' : ''}`}
                onClick={() => handleChange('is_active', true)}
              >
                Active
              </button>
              <button
                className={`filter-option ${filters.is_active === false ? 'active' : ''}`}
                onClick={() => handleChange('is_active', false)}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Verification</label>
            <div className="filter-options">
              <button
                className={`filter-option ${filters.is_verified === null ? 'active' : ''}`}
                onClick={() => handleChange('is_verified', null)}
              >
                All
              </button>
              <button
                className={`filter-option ${filters.is_verified === true ? 'active' : ''}`}
                onClick={() => handleChange('is_verified', true)}
              >
                Verified
              </button>
              <button
                className={`filter-option ${filters.is_verified === false ? 'active' : ''}`}
                onClick={() => handleChange('is_verified', false)}
              >
                Unverified
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Department</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search department..."
              value={filters.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
            />
          </div>

          {activeFilters.length > 0 && (
            <div className="filter-active">
              {filters.role && (
                <span className="filter-tag">
                  Role: {filters.role}
                  <button onClick={() => handleChange('role', '')}><FiX /></button>
                </span>
              )}
              {filters.is_active !== null && (
                <span className="filter-tag">
                  {filters.is_active ? 'Active' : 'Inactive'}
                  <button onClick={() => handleChange('is_active', null)}><FiX /></button>
                </span>
              )}
              {filters.is_verified !== null && (
                <span className="filter-tag">
                  {filters.is_verified ? 'Verified' : 'Unverified'}
                  <button onClick={() => handleChange('is_verified', null)}><FiX /></button>
                </span>
              )}
              {filters.department && (
                <span className="filter-tag">
                  Dept: {filters.department}
                  <button onClick={() => handleChange('department', '')}><FiX /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default UserFilters;
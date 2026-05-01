import React from 'react';
import { Filter, X, Calendar, Briefcase, Building2 } from 'lucide-react';

const EmploymentFilters = ({ filters, onFilterChange, onClearFilters, departments, className = '' }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Employment Type</label>
              <select
                value={filters.employment_type || ''}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Types</option>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="probation">Probation</option>
                <option value="intern">Intern</option>
                <option value="consultant">Consultant</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Department</label>
              <select
                value={filters.department_id || ''}
                onChange={(e) => handleChange('department_id', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Departments</option>
                {departments?.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.is_manager || false}
                    onChange={(e) => handleChange('is_manager', e.target.checked)}
                    className="rounded"
                  />
                  <span>Manager</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.is_executive || false}
                    onChange={(e) => handleChange('is_executive', e.target.checked)}
                    className="rounded"
                  />
                  <span>Executive</span>
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={filters.effective_from || ''}
                onChange={(e) => handleChange('effective_from', e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="From date"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={filters.effective_to || ''}
                onChange={(e) => handleChange('effective_to', e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="To date"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.is_active === undefined || filters.is_active === null}
                    onChange={() => handleChange('is_active', undefined)}
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.is_active === true}
                    onChange={() => handleChange('is_active', true)}
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.is_active === false}
                    onChange={() => handleChange('is_active', false)}
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmploymentFilters;
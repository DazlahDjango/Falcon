import React from 'react';
import { X } from 'lucide-react';

const TeamFilters = ({ filters, onFilterChange, onClear, departments = [], className = '' }) => {
  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };
  const handleClearAll = () => {
    onClear();
  };
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Filters</h4>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filters.is_active || ''}
            onChange={(e) => handleChange('is_active', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
          <select
            value={filters.department_id || ''}
            onChange={(e) => handleChange('department_id', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Parent Team Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Parent Team</label>
          <select
            value={filters.parent_team_id || ''}
            onChange={(e) => handleChange('parent_team_id', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="null">Root Teams (No Parent)</option>
          </select>
        </div>

        {/* Has Team Lead Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Team Lead</label>
          <select
            value={filters.has_team_lead || ''}
            onChange={(e) => handleChange('has_team_lead', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="true">Has Team Lead</option>
            <option value="false">No Team Lead</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
          {filters.is_active && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Status: {filters.is_active === 'true' ? 'Active' : 'Inactive'}
              <button onClick={() => handleChange('is_active', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.department_id && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Department ID: {filters.department_id.slice(0, 8)}...
              <button onClick={() => handleChange('department_id', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.parent_team_id === 'null' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Root Teams Only
              <button onClick={() => handleChange('parent_team_id', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.has_team_lead && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {filters.has_team_lead === 'true' ? 'Has Team Lead' : 'No Team Lead'}
              <button onClick={() => handleChange('has_team_lead', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default TeamFilters;
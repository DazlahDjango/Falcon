import React from 'react';
import { X } from 'lucide-react';
import { DEPARTMENT_SENSITIVITY_LABELS } from '../../../config/constants/structureConstants';

const DepartmentFilters = ({ filters, onFilterChange, onClear, className = '' }) => {
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
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sensitivity</label>
          <select
            value={filters.sensitivity_level || ''}
            onChange={(e) => handleChange('sensitivity_level', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {Object.entries(DEPARTMENT_SENSITIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Parent</label>
          <select
            value={filters.parent_id || ''}
            onChange={(e) => handleChange('parent_id', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="null">Root Departments</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Name or code..."
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
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
          {filters.sensitivity_level && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Sensitivity: {DEPARTMENT_SENSITIVITY_LABELS[filters.sensitivity_level]}
              <button onClick={() => handleChange('sensitivity_level', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.parent_id && filters.parent_id !== 'null' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Has Parent
              <button onClick={() => handleChange('parent_id', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.parent_id === 'null' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Root Departments
              <button onClick={() => handleChange('parent_id', '')} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default DepartmentFilters;
import React from 'react';

const AuditFilters = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (e) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'activated', label: 'Activated' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'subscription_changed', label: 'Subscription Changed' },
    { value: 'domain_added', label: 'Domain Added' },
    { value: 'domain_verified', label: 'Domain Verified' },
    { value: 'settings_changed', label: 'Settings Changed' },
    { value: 'user_added', label: 'User Added' },
    { value: 'user_removed', label: 'User Removed' },
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type
          </label>
          <select
            name="action"
            value={filters.action || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {actionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User
          </label>
          <input
            type="text"
            name="user"
            value={filters.user || ''}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            name="date_range"
            value={filters.date_range || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {dateRangeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            name="model"
            value={filters.model || ''}
            onChange={handleChange}
            placeholder="organisation, user, etc."
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AuditFilters;
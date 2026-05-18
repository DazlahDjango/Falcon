import { useState } from 'react';
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS, AUDIT_RESULTS, AUDIT_RESULT_LABELS } from '../../../config/constants/configConstants';

export const AuditLogFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action</label>
          <select value={localFilters.action || ''} onChange={(e) => handleChange('action', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Actions</option>
            {Object.entries(AUDIT_ACTIONS).map(([key, value]) => <option key={value} value={value}>{AUDIT_ACTION_LABELS[value]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Result</label>
          <select value={localFilters.result || ''} onChange={(e) => handleChange('result', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Results</option>
            {Object.entries(AUDIT_RESULTS).map(([key, value]) => <option key={value} value={value}>{AUDIT_RESULT_LABELS[value]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">User Role</label>
          <select value={localFilters.performed_by_role || ''} onChange={(e) => handleChange('performed_by_role', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="client_admin">Client Admin</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date Range</label>
          <input type="date" value={localFilters.performed_after || ''} onChange={(e) => handleChange('performed_after', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>
    </div>
  );
};
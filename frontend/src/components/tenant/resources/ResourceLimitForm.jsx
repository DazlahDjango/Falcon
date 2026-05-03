// frontend/src/components/tenant/resources/ResourceLimitForm.jsx
import React, { useState } from 'react';
import './resources.css';

export const ResourceLimitForm = ({ resource, onSubmit, onCancel, isLoading = false }) => {
    const [limitValue, setLimitValue] = useState(resource?.limit_value || '');
    const [warningThreshold, setWarningThreshold] = useState(resource?.warning_threshold || 80);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newLimit = parseInt(limitValue, 10);
        if (isNaN(newLimit) || newLimit < 1) {
            setError('Limit must be a positive number');
            return;
        }

        onSubmit({
            limit_value: newLimit,
            warning_threshold: warningThreshold,
        });
    };

    const resourceLabels = {
        users: 'Users',
        storage_mb: 'Storage (MB)',
        api_calls_per_day: 'API Calls Per Day',
        kpis: 'KPIs',
        departments: 'Departments',
        concurrent_sessions: 'Concurrent Sessions',
    };

    const label = resourceLabels[resource?.resource_type] || resource?.resource_type;

    return (
        <form onSubmit={handleSubmit} className="resource-limit-form">
            <div className="resource-limit-form-group">
                <label className="resource-limit-label">Resource Type</label>
                <input
                    type="text"
                    value={label}
                    disabled
                    className="resource-limit-input bg-gray-50"
                />
            </div>

            <div className="resource-limit-form-group">
                <label className="resource-limit-label">Limit Value</label>
                <input
                    type="number"
                    value={limitValue}
                    onChange={(e) => {
                        setLimitValue(e.target.value);
                        setError('');
                    }}
                    min="1"
                    className="resource-limit-input"
                    disabled={isLoading}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            <div className="resource-limit-form-group">
                <label className="resource-limit-label">Warning Threshold (%)</label>
                <input
                    type="number"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10))}
                    min="1"
                    max="100"
                    className="resource-limit-input"
                    disabled={isLoading}
                />
                <p className="text-xs text-gray-500">Alert when usage reaches this percentage</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};
// frontend/src/components/tenant/resources/ResourceLimitForm.jsx
import React, { useState } from 'react';
import './resources.css';

export const ResourceLimitForm = ({ resource, onSubmit, onCancel, isLoading = false }) => {
    const [limitValue, setLimitValue] = useState(resource?.limit_value || '');
    const [softLimit, setSoftLimit] = useState(resource?.soft_limit || '');
    const [hardLimit, setHardLimit] = useState(resource?.hard_limit || '');
    const [warningThreshold, setWarningThreshold] = useState(resource?.warning_threshold || 80);
    const [burstAllowed, setBurstAllowed] = useState(resource?.burst_allowed || false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newLimit = parseInt(limitValue, 10);
        if (isNaN(newLimit) || newLimit < 1) {
            setError('Limit must be a positive number');
            return;
        }

        const payload = {
            limit_value: newLimit,
            warning_threshold: warningThreshold,
            burst_allowed: burstAllowed,
        };

        // Only include soft/hard limits if set
        if (softLimit !== '') payload.soft_limit = parseInt(softLimit, 10) || null;
        if (hardLimit !== '') payload.hard_limit = parseInt(hardLimit, 10) || null;

        onSubmit(payload);
    };

    const resourceLabels = {
        USERS: 'Users',
        STORAGE_MB: 'Storage (MB)',
        API_CALLS_PER_DAY: 'API Calls Per Day',
        KPIS: 'KPIs',
        DEPARTMENTS: 'Departments',
        CONCURRENT_SESSIONS: 'Concurrent Sessions',
    };

    const label = resourceLabels[resource?.resource_type] || resource?.resource_type;

    return (
        <form onSubmit={handleSubmit} className="resource-limit-form">
            {/* Resource type — read-only */}
            <div className="resource-limit-form-group">
                <label className="resource-limit-label">Resource Type</label>
                <input
                    type="text"
                    value={label}
                    disabled
                    className="resource-limit-input bg-gray-50"
                />
            </div>

            {/* Main limit */}
            <div className="resource-limit-form-group">
                <label className="resource-limit-label">Limit Value</label>
                <input
                    type="number"
                    value={limitValue}
                    onChange={(e) => { setLimitValue(e.target.value); setError(''); }}
                    min="1"
                    className="resource-limit-input"
                    disabled={isLoading}
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            {/* Soft limit */}
            <div className="resource-limit-form-group">
                <label className="resource-limit-label">
                    Soft Limit{' '}
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                        (optional — triggers warning before hard limit)
                    </span>
                </label>
                <input
                    type="number"
                    value={softLimit}
                    onChange={(e) => setSoftLimit(e.target.value)}
                    min="1"
                    placeholder="e.g. 90"
                    className="resource-limit-input"
                    disabled={isLoading}
                />
            </div>

            {/* Hard limit */}
            <div className="resource-limit-form-group">
                <label className="resource-limit-label">
                    Hard Limit{' '}
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                        (optional — absolute ceiling, blocks further usage)
                    </span>
                </label>
                <input
                    type="number"
                    value={hardLimit}
                    onChange={(e) => setHardLimit(e.target.value)}
                    min="1"
                    placeholder="e.g. 110"
                    className="resource-limit-input"
                    disabled={isLoading}
                />
            </div>

            {/* Warning threshold */}
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

            {/* Burst allowed toggle */}
            <div className="resource-limit-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                    <input
                        type="checkbox"
                        checked={burstAllowed}
                        onChange={(e) => setBurstAllowed(e.target.checked)}
                        disabled={isLoading}
                        style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }}
                    />
                    <span style={{ fontWeight: 500 }}>Allow Burst Usage</span>
                </label>
                <p className="text-xs text-gray-500" style={{ marginTop: '4px', paddingLeft: '26px' }}>
                    Permits temporary usage above the limit during high-load periods
                </p>
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
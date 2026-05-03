// frontend/src/components/tenant/migrations/MigrationFilterBar.jsx
import React from 'react';
import './migrations.css';

export const MigrationFilterBar = ({ filters, onFilterChange, onClearFilters }) => {
    const handleStatusChange = (e) => {
        const value = e.target.value;
        if (value) {
            onFilterChange({ ...filters, status: value });
        } else {
            const { status, ...rest } = filters;
            onFilterChange(rest);
        }
    };

    const handleAppChange = (e) => {
        const value = e.target.value;
        if (value) {
            onFilterChange({ ...filters, app_name: value });
        } else {
            const { app_name, ...rest } = filters;
            onFilterChange(rest);
        }
    };

    const hasFilters = filters.status || filters.app_name;

    return (
        <div className="migration-filter-bar">
            <div className="migration-filter-group">
                <label className="migration-filter-label">Status:</label>
                <select
                    value={filters.status || ''}
                    onChange={handleStatusChange}
                    className="migration-filter-select"
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="rolled_back">Rolled Back</option>
                </select>
            </div>

            <div className="migration-filter-group">
                <label className="migration-filter-label">App:</label>
                <select
                    value={filters.app_name || ''}
                    onChange={handleAppChange}
                    className="migration-filter-select"
                >
                    <option value="">All Apps</option>
                    <option value="accounts">Accounts</option>
                    <option value="kpi">KPI</option>
                    <option value="organisations">Organisations</option>
                    <option value="tenant">Tenant</option>
                    <option value="core">Core</option>
                </select>
            </div>

            {hasFilters && (
                <button
                    onClick={onClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};
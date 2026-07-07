// frontend/src/components/tenant/resources/ResourceLimitTable.jsx
import React from 'react';
import { FiZap, FiEdit } from 'react-icons/fi';
import './resources.css';

export const ResourceLimitTable = ({ resources, onEdit, onIncrement, onDecrement, onSnapshot, loading = false }) => {
    if (loading) {
        return (
            <div className="resource-table-container">
                <div className="p-8 text-center text-gray-500">Loading resources...</div>
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div className="resource-table-container">
                <div className="p-8 text-center text-gray-500">No resources found</div>
            </div>
        );
    }

    const resourceLabels = {
        USERS: 'Users',
        STORAGE_MB: 'Storage (MB)',
        API_CALLS_PER_DAY: 'API Calls Per Day',
        KPIS: 'KPIs',
        DEPARTMENTS: 'Departments',
        CONCURRENT_SESSIONS: 'Concurrent Sessions',
    };

    const getStatusBadge = (percentage, burstAllowed) => {
        let text, bg, color;
        if (percentage >= 100) { text = 'Exceeded'; bg = '#fee2e2'; color = '#991b1b'; }
        else if (percentage >= 90) { text = 'Critical'; bg = '#fee2e2'; color = '#dc2626'; }
        else if (percentage >= 80) { text = 'Warning'; bg = '#fef3c7'; color = '#92400e'; }
        else { text = 'Good'; bg = '#dcfce7'; color = '#166534'; }

        return (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '99px', background: bg, color }}>
                    {text}
                </span>
                {burstAllowed && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#7c3aed', background: '#ede9fe', padding: '2px 5px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <FiZap size={9} /> Burst
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="resource-table-container">
            <div className="overflow-x-auto">
                <table className="resource-table">
                    <thead>
                        <tr>
                            <th>Resource Type</th>
                            <th>Current Usage</th>
                            <th>Soft Limit</th>
                            <th>Hard Limit</th>
                            <th>Main Limit</th>
                            <th>Usage %</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((resource) => {
                            const effectiveLimit = resource.soft_limit || resource.limit_value || 0;
                            const percentage = effectiveLimit > 0
                                ? (resource.current_value / effectiveLimit) * 100
                                : 0;

                            let progressColor = '#22c55e';
                            if (percentage >= 100) progressColor = '#ef4444';
                            else if (percentage >= 90) progressColor = '#dc2626';
                            else if (percentage >= 80) progressColor = '#f59e0b';

                            return (
                                <tr key={resource.id}>
                                    <td className="font-medium">
                                        {resourceLabels[resource.resource_type] || resource.resource_type}
                                    </td>
                                    <td>{(resource.current_value ?? 0).toLocaleString()}</td>
                                    <td style={{ color: '#92400e' }}>
                                        {resource.soft_limit != null ? resource.soft_limit.toLocaleString() : '—'}
                                    </td>
                                    <td style={{ color: '#991b1b' }}>
                                        {resource.hard_limit != null ? resource.hard_limit.toLocaleString() : '—'}
                                    </td>
                                    <td>{(resource.limit_value ?? 0).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                                <div style={{
                                                    width: `${Math.min(percentage, 100)}%`,
                                                    height: '100%',
                                                    background: progressColor,
                                                    borderRadius: '3px',
                                                    transition: 'width 0.3s ease',
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: progressColor, fontWeight: 600, minWidth: '40px' }}>
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(percentage, resource.burst_allowed)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {onDecrement && (
                                                <button
                                                    onClick={() => onDecrement(resource.id, 1)}
                                                    className="resource-btn resource-btn-secondary resource-btn-sm"
                                                    disabled={loading}
                                                    title="Decrement −1"
                                                >−1</button>
                                            )}
                                            {onIncrement && (
                                                <button
                                                    onClick={() => onIncrement(resource.id, 1)}
                                                    className="resource-btn resource-btn-secondary resource-btn-sm"
                                                    disabled={loading}
                                                    title="Increment +1"
                                                >+1</button>
                                            )}
                                            {onSnapshot && (
                                                <button
                                                    onClick={() => onSnapshot(resource.id)}
                                                    className="resource-btn resource-btn-secondary resource-btn-sm"
                                                    disabled={loading}
                                                    title="Take snapshot"
                                                >📸</button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(resource)}
                                                    className="resource-btn resource-btn-primary resource-btn-sm"
                                                    disabled={loading}
                                                    title="Edit limits"
                                                >
                                                    <FiEdit size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
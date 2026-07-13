// frontend/src/components/tenant/resources/ResourceUsageDashboard.jsx
import React, { useEffect, useCallback } from 'react';
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiDatabase, FiRefreshCw, FiZap } from 'react-icons/fi';
import { useResources } from '../../../hooks/tenant';
import { ResourceLimitCard } from './ResourceLimitCard';
import { QuotaWarningAlert } from './QuotaWarningAlert';
import './resources.css';

const HEALTH_CONFIG = {
    healthy:  { icon: FiCheckCircle,   color: '#22c55e', label: 'All Healthy' },
    warning:  { icon: FiAlertTriangle, color: '#f59e0b', label: 'Usage Warning' },
    critical: { icon: FiAlertCircle,   color: '#ef4444', label: 'Limit Exceeded' },
    no_data:  { icon: FiDatabase,      color: '#94a3b8', label: 'No Data' },
};

const RESOURCE_TYPES = [
    { key: 'USERS',                label: 'Users',               unit: '',   icon: '👥' },
    { key: 'STORAGE_MB',           label: 'Storage',             unit: 'MB', icon: '💾', format: (v) => `${v} MB` },
    { key: 'API_CALLS_PER_DAY',    label: 'API Calls',           unit: '',   icon: '📡', format: (v) => v.toLocaleString() },
    { key: 'KPIS',                 label: 'KPIs',                unit: '',   icon: '📊' },
    { key: 'DEPARTMENTS',          label: 'Departments',         unit: '',   icon: '🏢' },
    { key: 'CONCURRENT_SESSIONS',  label: 'Concurrent Sessions', unit: '',   icon: '🖥️' },
];

export const ResourceUsageDashboard = ({ organizationId, warnings: externalWarnings, loading: externalLoading }) => {
    const {
        resources,
        summary,
        exceededList,
        overallHealth,
        loading: hookLoading,
        error,
        fetchList,
        fetchSummary,
        fetchExceeded,
        syncFromBilling,
        increment,
        decrement,
    } = useResources({
        autoFetch: !!organizationId,
        filters: organizationId ? { organization_id: organizationId } : {},
    });

    const loading = externalLoading || hookLoading;

    // Load summary and exceeded on mount / organizationId change
    useEffect(() => {
        if (organizationId) {
            fetchSummary(organizationId).catch(() => {});
            fetchExceeded().catch(() => {});
        }
    }, [organizationId, fetchSummary, fetchExceeded]);

    const handleRefresh = useCallback(() => {
        fetchList();
        if (organizationId) {
            fetchSummary(organizationId).catch(() => {});
            fetchExceeded().catch(() => {});
        }
    }, [fetchList, fetchSummary, fetchExceeded, organizationId]);

    const healthCfg = HEALTH_CONFIG[overallHealth] || HEALTH_CONFIG.no_data;
    const HealthIcon = healthCfg.icon;

    // Build resource map — prefer summary data (richer), fallback to resource list
    const dataSource = summary.length > 0 ? summary : resources;
    const resourceMap = {};
    dataSource.forEach(r => {
        resourceMap[r.resource_type] = r;
    });

    // Build warnings from exceeded list if no external warnings provided
    const warnings = externalWarnings ?? exceededList.map(r => ({
        resource_type: r.resource_type_display || r.resource_type,
        percentage: r.percentage_used,
        current: r.current_value,
        limit: r.limit_value,
        severity: 'critical',
        title: `${r.resource_type_display || r.resource_type} limit exceeded`,
    }));

    if (loading && dataSource.length === 0) {
        return (
            <div className="resource-dashboard">
                <div className="resource-loading">
                    <div className="resource-loading-spinner"></div>
                    <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Loading resource data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="resource-dashboard">
                <div style={{ textAlign: 'center', padding: '32px', color: '#dc2626' }}>
                    <FiAlertCircle size={32} style={{ marginBottom: '8px' }} />
                    <p style={{ fontWeight: 500 }}>Failed to load resources</p>
                </div>
            </div>
        );
    }

    return (
        <div className="resource-dashboard">
            {/* Dashboard header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 className="resource-dashboard-title" style={{ margin: 0 }}>Resource Usage</h2>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', fontWeight: 600, color: healthCfg.color,
                            background: `${healthCfg.color}18`, padding: '3px 10px', borderRadius: '99px'
                        }}>
                            <HealthIcon size={12} /> {healthCfg.label}
                        </span>
                    </div>
                    <p className="resource-dashboard-subtitle" style={{ marginTop: '4px' }}>
                        Monitor your tenant's resource consumption and limits
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="resource-btn resource-btn-secondary resource-btn-sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh data"
                    >
                        <FiRefreshCw size={14} style={{ marginRight: '4px' }} />
                        Refresh
                    </button>
                    {organizationId && (
                        <button
                            className="resource-btn resource-btn-secondary resource-btn-sm"
                            onClick={() => syncFromBilling(organizationId).catch(() => {})}
                            disabled={loading}
                            title="Sync limits from billing"
                        >
                            <FiDatabase size={14} style={{ marginRight: '4px' }} />
                            Sync Billing
                        </button>
                    )}
                </div>
            </div>

            {/* Warning alerts */}
            {warnings && warnings.length > 0 && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {warnings.map((warning, index) => (
                        <QuotaWarningAlert key={index} warning={warning} />
                    ))}
                </div>
            )}

            {/* Resource cards grid */}
            <div className="resource-grid">
                {RESOURCE_TYPES.map(type => {
                    const resource = resourceMap[type.key];
                    if (!resource) return null;

                    return (
                        <div key={type.key} style={{ position: 'relative' }}>
                            <ResourceLimitCard
                                title={type.label}
                                icon={type.icon}
                                current={resource.current_value ?? 0}
                                limit={resource.limit_value ?? 0}
                                softLimit={resource.soft_limit}
                                hardLimit={resource.hard_limit}
                                unit={type.unit}
                                format={type.format}
                                burstAllowed={resource.burst_allowed}
                            />
                            {/* Quick ±1 buttons */}
                            <div style={{
                                display: 'flex', gap: '4px', justifyContent: 'center',
                                padding: '6px 12px 12px',
                            }}>
                                <button
                                    className="resource-btn resource-btn-secondary resource-btn-sm"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => decrement(resource.id, 1).catch(() => {})}
                                    disabled={loading}
                                    title="Decrement usage"
                                >−1</button>
                                <button
                                    className="resource-btn resource-btn-secondary resource-btn-sm"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => increment(resource.id, 1).catch(() => {})}
                                    disabled={loading}
                                    title="Increment usage"
                                >+1</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {dataSource.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <FiDatabase size={32} style={{ marginBottom: '8px' }} />
                    <p>No resource data available for this organization.</p>
                </div>
            )}
        </div>
    );
};
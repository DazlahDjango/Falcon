import React, { useEffect, useCallback, useMemo } from 'react';
import {
    FiHeart, FiCheckCircle, FiAlertTriangle,
    FiActivity, FiRefreshCw, FiAlertCircle, FiClock
} from 'react-icons/fi';
import { useOrganizations, useOrganizationsHealth, useConnections } from '../../../hooks/tenant';

export const ConnectionHealthPage = () => {
    const {
        healthyCount,
        unhealthyCount,
        loading: healthLoading,
        list: organizationsHealthList,
        fetchHealth
    } = useOrganizationsHealth({ autoFetch: true });

    const {
        organizations,
        fetchList: fetchAllTenants,
        loading: orgsLoading
    } = useOrganizations({ autoFetch: true });

    const {
        healthStatus,
        healthCheck,
        loading: connectionsLoading
    } = useConnections();

    const loading = healthLoading || connectionsLoading;
    const tenantsLoading = orgsLoading;
    const tenants = organizations;

    // Handle batch scan
    const checkAllTenants = useCallback(async (tenantIds) => {
        await healthCheck();
        await fetchHealth();
    }, [healthCheck, fetchHealth]);

    // Handle single tenant check
    const checkTenant = useCallback(async (tenantId) => {
        await healthCheck({ organization_id: tenantId });
        await fetchHealth();
    }, [healthCheck, fetchHealth]);

    const handleRunScan = useCallback(async () => {
        if (tenants && tenants.length > 0) {
            const tenantIds = tenants.map(t => t.id);
            await checkAllTenants(tenantIds);
        }
    }, [tenants, checkAllTenants]);

    const handleCheckSingle = useCallback(async (tenantId) => {
        await checkTenant(tenantId);
    }, [checkTenant]);

    const healthSummary = null;

    // Memoized summary stats
    const summaryStats = useMemo(() => [
        {
            label: 'Healthy Tenants',
            value: healthyCount,
            icon: FiCheckCircle,
            color: 'green'
        },
        {
            label: 'Unhealthy',
            value: unhealthyCount,
            icon: FiAlertTriangle,
            color: 'red'
        },
        {
            label: 'Avg Latency',
            value: `${Math.round(healthSummary?.average_response_ms || healthSummary?.avg_response_time || 0)}ms`,
            icon: FiActivity,
            color: 'blue'
        },
    ], [healthyCount, unhealthyCount, healthSummary]);

    // Get unhealthy tenants list
    const unhealthyTenants = useMemo(() => organizationsHealthList?.filter(org => org.status === 'unhealthy') || [], [organizationsHealthList]);

    // Loading state
    if ((loading || tenantsLoading) && (!healthStatus || Object.keys(healthStatus).length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading health dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                        <FiHeart className={`h-8 w-8 ${unhealthyCount === 0 ? 'text-green-600 animate-pulse' : 'text-green-600'}`} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Health</h1>
                        <p className="text-slate-500 mt-1">Verification of database stability and integrity</p>
                    </div>
                </div>
                <button
                    onClick={handleRunScan}
                    disabled={loading || tenantsLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Run Deep Scan
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaryStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className={`h-12 w-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                            </div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</h4>
                            <p className="text-3xl font-bold mt-2 text-slate-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-900">Tenant Connectivity Matrix</h3>
                    <p className="text-sm text-slate-500 mt-1">Real-time health status of all tenant databases</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Latency</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Check</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants && tenants.length > 0 ? (
                                tenants.map((tenant) => {
                                    const status = healthStatus?.[tenant.id];
                                    return (
                                        <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                                                        {tenant.name?.substring(0, 2).toUpperCase() || 'TN'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{tenant.name}</p>
                                                        <p className="text-xs text-slate-500">{tenant.schema_name || tenant.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {status ? (
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status.is_healthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        <span className={`h-2 w-2 rounded-full ${status.is_healthy ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                                        {status.is_healthy ? 'Healthy' : 'Unhealthy'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Not checked</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status?.response_time_ms ? (
                                                    <span className="text-sm text-slate-600">
                                                        {status.response_time_ms}ms
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status?.last_successful_check ? (
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(status.last_successful_check).toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Never</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleCheckSingle(tenant.id)}
                                                    disabled={loading}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Check health"
                                                >
                                                    <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No tenants found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Error Details Section */}
            {unhealthyTenants.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <FiAlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-800">Health Issues Detected</h3>
                            <p className="text-sm text-red-600">
                                {unhealthyTenants.length} tenant(s) require attention
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unhealthyTenants.map((issue, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-red-100">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-red-100 rounded-lg">
                                        <FiAlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800 text-sm">Tenant: {issue.tenant_id}</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            {issue.error_message || 'Connection failed or timeout occurred'}
                                        </p>
                                        {issue.response_time_ms && (
                                            <p className="text-xs text-red-500 mt-2">
                                                Response time: {issue.response_time_ms}ms
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectionHealthPage;
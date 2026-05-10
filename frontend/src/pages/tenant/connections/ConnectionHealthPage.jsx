import React, { useEffect } from 'react';
import { 
    FiHeart, FiCheckCircle, FiShield, FiAlertTriangle, 
    FiActivity, FiRefreshCw, FiAlertCircle, FiClock 
} from 'react-icons/fi';
import { useHealthDashboard } from '../../../hooks/tenant';
import { useTenants } from '../../../hooks/tenant';

export const ConnectionHealthPage = () => {
    const { 
        healthStatus, 
        healthSummary, 
        loading, 
        checkAllTenants,
        checkTenant
    } = useHealthDashboard();

    const { tenants, refetch: fetchAllTenants } = useTenants();

    useEffect(() => {
        if (fetchAllTenants) {
            fetchAllTenants();
        }
    }, [fetchAllTenants]);

    const handleRunScan = async () => {
        const tenantIds = tenants.map(t => t.id);
        await checkAllTenants(tenantIds);
    };

    const handleCheckSingle = async (tenantId) => {
        await checkTenant(tenantId);
    };

    if (loading && Object.keys(healthStatus).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="kpi-spinner" />
            </div>
        );
    }

    const summaryStats = [
        { 
            label: 'Healthy Tenants', 
            value: healthSummary?.healthy || 0, 
            icon: FiCheckCircle, 
            color: 'green' 
        },
        { 
            label: 'Unhealthy', 
            value: healthSummary?.unhealthy || 0, 
            icon: FiAlertTriangle, 
            color: 'red' 
        },
        { 
            label: 'Avg Latency', 
            value: `${healthSummary?.avg_response_time || 0}ms`, 
            icon: FiActivity, 
            color: 'blue' 
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-50 rounded-3xl">
                        <FiHeart className={`h-8 w-8 text-green-600 ${healthSummary?.unhealthy === 0 ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">System Health</h1>
                        <p className="text-slate-500 mt-1">Verification of database stability and integrity</p>
                    </div>
                </div>
                <button 
                    onClick={handleRunScan}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Run Deep Scan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all">
                        <div className={`h-12 w-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</h4>
                        <p className={`text-2xl font-black mt-1 text-slate-900`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tenant Connectivity Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/10">
                                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tenant</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Latency</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Last Check</th>
                                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => {
                                const status = healthStatus[tenant.id];
                                return (
                                    <tr key={tenant.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{tenant.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{tenant.schema_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {status ? (
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.is_healthy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${status.is_healthy ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                                    {status.is_healthy ? 'Healthy' : 'Error'}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Not Checked</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <FiActivity className="text-slate-300" />
                                                <span className="text-sm font-bold text-slate-600">
                                                    {status?.response_time_ms ? `${status.response_time_ms}ms` : '--'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                <FiClock />
                                                {status?.last_successful_check ? new Date(status.last_successful_check).toLocaleTimeString() : 'Never'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleCheckSingle(tenant.id)}
                                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                                title="Check Connection"
                                            >
                                                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Error Details Section */}
            {Object.values(healthStatus).some(h => !h.is_healthy) && (
                <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <FiAlertCircle className="h-6 w-6 text-red-600" />
                        <h3 className="text-xl font-bold text-red-900">Health Issues Detected</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.values(healthStatus).filter(h => !h.is_healthy).map((issue, i) => (
                            <div key={i} className="bg-white/50 border border-red-200 p-4 rounded-2xl flex gap-4">
                                <div className="p-2 bg-red-100 rounded-xl h-fit">
                                    <FiAlertTriangle className="text-red-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-900">Tenant: {issue.tenant_id}</p>
                                    <p className="text-sm text-red-700/80 mt-1">{issue.error_message || 'Database connection timeout'}</p>
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


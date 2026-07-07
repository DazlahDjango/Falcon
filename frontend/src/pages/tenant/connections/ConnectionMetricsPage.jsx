import React, { useEffect } from 'react';
import { 
    FiBarChart2, FiActivity, FiArrowUpRight, FiArrowDownRight, 
    FiZap, FiClock, FiDatabase, FiServer, FiAlertCircle 
} from 'react-icons/fi';
import { useConnections } from '../../../hooks/tenant';
import ConnectionHealthChart from '../../../components/tenant/connections/ConnectionHealthChart';

export const ConnectionMetricsPage = () => {
    const { 
        metrics, 
        loading, 
        error, 
        refresh 
    } = useConnections({ autoRefresh: true, refreshInterval: 60000 });

    useEffect(() => {
        refresh();
    }, [refresh]);

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="kpi-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Failed to load metrics</h3>
                <p className="text-slate-500 mt-2">{error}</p>
                <button 
                    onClick={refresh}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    const stats = [
        { 
            label: 'Total Connections', 
            value: metrics?.total_connections || 0, 
            sub: 'Cumulative', 
            icon: FiDatabase, 
            color: 'blue' 
        },
        { 
            label: 'Active Now', 
            value: metrics?.active_connections || 0, 
            sub: `${((metrics?.active_connections / metrics?.total_connections) * 100 || 0).toFixed(1)}% util`, 
            icon: FiActivity, 
            color: 'green' 
        },
        { 
            label: 'Avg Duration', 
            value: `${(metrics?.avg_connection_duration_seconds || 0).toFixed(1)}s`, 
            sub: 'Per session', 
            icon: FiClock, 
            color: 'purple' 
        },
        { 
            label: 'Max Concurrent', 
            value: metrics?.max_concurrent_connections || 0, 
            sub: 'Peak load', 
            icon: FiZap, 
            color: 'amber' 
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Performance Metrics</h1>
                    <p className="text-slate-500 mt-1">Deep analysis of database connection performance</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
                    <p className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-${stat.color}-50 rounded-2xl`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Throughput Analysis</h3>
                        <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Real-time</div>
                    </div>
                    {metrics?.connection_history ? (
                        <ConnectionHealthChart 
                            data={metrics.connection_history}
                            type="area"
                        />
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <FiBarChart2 className="h-12 w-12 mb-2 opacity-20" />
                            <p className="font-bold">Collecting historical data...</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-6">Activity Breakdown</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Last Hour', value: metrics?.connections_last_hour, color: 'blue' },
                                { label: 'Last 24 Hours', value: metrics?.connections_last_24h, color: 'indigo' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span>{item.value} requests</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-${item.color}-500 rounded-full`}
                                            style={{ width: `${Math.min(100, (item.value / (metrics?.total_connections || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <FiServer className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cluster Status</p>
                                    <p className="text-sm font-bold">Primary Node Operational</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <FiZap className="absolute -right-12 -bottom-12 h-64 w-64 text-white/5 rotate-12" />
                </div>
            </div>
        </div>
    );
};

export default ConnectionMetricsPage;


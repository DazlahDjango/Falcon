import React from 'react';
import { FiBarChart2, FiActivity, FiArrowUpRight, FiArrowDownRight, FiZap } from 'react-icons/fi';

export const ConnectionMetricsPage = () => {
    const stats = [
        { label: 'Avg Latency', value: '1.2ms', change: '-0.2ms', trend: 'up', icon: FiZap, color: 'blue' },
        { label: 'Throughput', value: '4.2k ops/s', change: '+12%', trend: 'up', icon: FiActivity, color: 'green' },
        { label: 'Peak Load', value: '84%', change: '+5%', trend: 'down', icon: FiBarChart2, color: 'purple' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Performance Metrics</h1>
                    <p className="text-slate-500 mt-1">Deep analysis of database connection performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-${stat.color}-50 rounded-2xl`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-12 text-center">
                <FiBarChart2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Advanced Charts Coming Soon</h3>
                <p className="text-slate-500 mt-2">We are currently integrating high-frequency metric visualization.</p>
            </div>
        </div>
    );
};

export default ConnectionMetricsPage;

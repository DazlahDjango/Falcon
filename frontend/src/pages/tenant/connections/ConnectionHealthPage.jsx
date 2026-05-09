import React from 'react';
import { FiHeart, FiCheckCircle, FiShield, FiAlertTriangle, FiActivity } from 'react-icons/fi';

export const ConnectionHealthPage = () => {
    const checks = [
        { name: 'Schema Integrity', status: 'Healthy', icon: FiShield, color: 'green' },
        { name: 'Index Performance', status: 'Optimal', icon: FiActivity, color: 'blue' },
        { name: 'Deadlock Detection', status: 'No issues', icon: FiAlertTriangle, color: 'green' },
        { name: 'Connection Pool', status: 'Healthy', icon: FiCheckCircle, color: 'green' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-3xl">
                    <FiHeart className="h-8 w-8 text-green-600 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Health</h1>
                    <p className="text-slate-500 mt-1">Verification of database stability and integrity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {checks.map((check, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`h-12 w-12 bg-${check.color}-50 rounded-2xl flex items-center justify-center mb-4`}>
                            <check.icon className={`h-6 w-6 text-${check.color}-600`} />
                        </div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">{check.name}</h4>
                        <p className={`text-lg font-bold mt-1 text-${check.color}-700`}>{check.status}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">Integrity Report</h2>
                    <p className="text-slate-400 max-w-lg mb-8">
                        The latest deep-scan of the database cluster was completed 12 minutes ago. 
                        All schemas are synchronized and no corruption was detected.
                    </p>
                    <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                        Run Deep Scan
                    </button>
                </div>
                <FiShield className="absolute -right-20 -bottom-20 h-96 w-96 text-white/5" />
            </div>
        </div>
    );
};

export default ConnectionHealthPage;

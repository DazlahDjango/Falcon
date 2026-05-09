// frontend/src/components/tenant/connections/ConnectionTable.jsx
import React, { useState } from 'react';
import { FiMoreVertical, FiCheckCircle, FiXCircle, FiClock, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
    const config = {
        active: { 
            label: 'Active', 
            styles: 'bg-green-50 text-green-700 border-green-200 shadow-green-100', 
            icon: FiActivity,
            dot: 'bg-green-500'
        },
        idle: { 
            label: 'Idle', 
            styles: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100', 
            icon: FiClock,
            dot: 'bg-amber-500'
        },
        closed: { 
            label: 'Closed', 
            styles: 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100', 
            icon: FiXCircle,
            dot: 'bg-slate-400'
        },
        error: { 
            label: 'Error', 
            styles: 'bg-red-50 text-red-700 border-red-200 shadow-red-100', 
            icon: FiXCircle,
            dot: 'bg-red-500'
        },
    };
    
    const { label, styles, icon: Icon, dot } = config[status] || config.closed;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${styles}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse`} />
            {label}
        </span>
    );
};

const ConnectionTable = ({ connections, onRefresh, onViewDetails, onUpdateStatus, loading }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return 'Never';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Syncing connection pool...</p>
            </div>
        );
    }

    if (connections.length === 0) {
        return (
            <div className="text-center py-24 bg-white">
                <div className="inline-flex p-6 bg-slate-50 rounded-3xl mb-4">
                    <FiActivity className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No active connections</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">The database pool is currently empty or no tenants match your filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant Context</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Idle Time</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {connections.map((connection) => (
                        <tr key={connection.id} className="group hover:bg-slate-50/80 transition-colors duration-150">
                            <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <FiActivity className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 font-mono">
                                        {connection.connection_id?.slice(0, 8)}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">{connection.tenant_name || 'System'}</span>
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">{connection.tenant_id?.slice(0, 8)}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <StatusBadge status={connection.status} />
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-600">Last used: {formatTime(connection.last_used_at)}</span>
                                    <span className="text-[10px] text-slate-400">Created: {formatTime(connection.connected_at)}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-700">
                                    {connection.idle_duration_seconds
                                        ? `${Math.floor(connection.idle_duration_seconds / 60)}m ${connection.idle_duration_seconds % 60}s`
                                        : '0s'}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onViewDetails(connection.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="View Details"
                                    >
                                        <FiActivity className="h-4 w-4" />
                                    </button>
                                    {connection.status !== 'closed' && (
                                        <button
                                            onClick={() => onUpdateStatus(connection.id, 'closed')}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Terminate Connection"
                                        >
                                            <FiXCircle className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConnectionTable;
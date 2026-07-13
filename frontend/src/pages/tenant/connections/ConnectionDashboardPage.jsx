// frontend/src/pages/tenant/connections/ConnectionDashboardPage.jsx
import React, { useState } from 'react';
import ConnectionStatsCards from '../../../components/tenant/connections/ConnectionStatsCards';
import ConnectionTable from '../../../components/tenant/connections/ConnectionTable';
import ConnectionHealthChart from '../../../components/tenant/connections/ConnectionHealthChart';
import { useConnections, useConnectionManager } from '../../../hooks/tenant';
import { useAuth } from '../../../hooks/accounts/useAuth';

import { FiRefreshCw, FiSettings, FiAlertTriangle, FiActivity, FiZap, FiServer, FiShield } from 'react-icons/fi';

export const ConnectionDashboardPage = () => {
    const user = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';

    const {
        filteredConnections,
        stats,
        metrics,
        loading,
        refresh,
        updateFilters,
        healthCheck,
    } = useConnections({ autoRefresh: true, refreshInterval: 30000 });

    const {
        closeIdle,
        recycleAllConnections,
        loading: managerLoading,
    } = useConnectionManager();

    const [selectedConnection, setSelectedConnection] = useState(null);
    const [showManagerPanel, setShowManagerPanel] = useState(false);

    const handleViewDetails = (connectionId) => {
        setSelectedConnection(connectionId);
    };

    const handleUpdateStatus = async (connectionId, status) => {
        await refresh();
    };

    const handleCloseIdle = async () => {
        if (window.confirm('Close all idle connections? This may affect performance.')) {
            await closeIdle(30);
            await refresh();
        }
    };

    const handleRecycleAll = async () => {
        if (window.confirm('WARNING: Recycling all connections will temporarily disrupt service. Continue?')) {
            await recycleAllConnections();
            await refresh();
        }
    };

    const handleHealthCheck = async () => {
        await healthCheck();
        await refresh();
    };

    const chartData = metrics?.connection_history || [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <FiServer className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pool Command Center</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <FiActivity className="text-blue-500" />
                            Global monitoring of database resource allocation
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleHealthCheck}
                        className="px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-bold text-sm flex items-center gap-2 border border-green-200"
                    >
                        <FiShield className="h-4 w-4" />
                        Verify Cluster
                    </button>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setShowManagerPanel(!showManagerPanel)}
                            className={`px-5 py-2.5 rounded-xl transition-all font-bold text-sm flex items-center gap-2 border ${showManagerPanel
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <FiSettings className={`h-4 w-4 ${showManagerPanel ? 'animate-spin-slow' : ''}`} />
                            Manager
                        </button>
                    )}
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync
                    </button>
                </div>
            </div>

            {/* Manager Panel (Admin only) */}
            {isSuperAdmin && showManagerPanel && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 mb-6 relative overflow-hidden animate-slide-down">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                            <div className="p-3 bg-amber-200/50 rounded-2xl">
                                <FiAlertTriangle className="h-6 w-6 text-amber-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Active Pool Management</h3>
                                <p className="text-amber-700/80 text-sm max-w-md">
                                    Directly manipulate the database driver's connection stack.
                                    These actions are irreversible and logged for audit.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseIdle}
                                disabled={managerLoading}
                                className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                            >
                                Purge Idle (30m)
                            </button>
                            <button
                                onClick={handleRecycleAll}
                                disabled={managerLoading}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                                Recycle Entire Pool
                            </button>
                        </div>
                    </div>
                    <FiZap className="absolute -right-8 -bottom-8 h-48 w-48 text-amber-200/20 rotate-12" />
                </div>
            )}

            {/* Stats Cards and Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12">
                    <ConnectionStatsCards stats={stats} metrics={metrics} />
                </div>

                {chartData.length > 0 && (
                    <div className="xl:col-span-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <ConnectionHealthChart
                            data={chartData}
                            title="Active Connection Distribution"
                            type="area"
                        />
                    </div>
                )}
            </div>

            {/* Connections Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Real-time Stream</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Snapshot latency: 42ms</p>
                    </div>
                </div>
                <ConnectionTable
                    connections={filteredConnections}
                    onRefresh={refresh}
                    onViewDetails={handleViewDetails}
                    onUpdateStatus={handleUpdateStatus}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ConnectionDashboardPage;
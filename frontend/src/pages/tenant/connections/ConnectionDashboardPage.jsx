// frontend/src/pages/tenant/connections/ConnectionDashboardPage.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiRefreshCw, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import ConnectionStatsCards from '../../../components/tenant/connection/ConnectionStatsCards';
import ConnectionTable from '../../../components/tenant/connection/ConnectionTable';
import ConnectionHealthChart from '../../../components/tenant/connection/ConnectionHealthChart';
import { useConnections, useConnectionManager } from '../../../hooks/tenant';
import { useAuth } from '../../../hooks/accounts/useAuth';

const ConnectionDashboardPage = () => {
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
        // Navigate to detail page or open modal
    };

    const handleUpdateStatus = async (connectionId, status) => {
        // Implement status update
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

    // Prepare chart data
    const chartData = metrics?.connection_history || [];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Connection Pool Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and manage database connections across all tenants
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleHealthCheck}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                    >
                        <FiRefreshCw className="h-4 w-4 mr-2" />
                        Health Check
                    </button>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setShowManagerPanel(!showManagerPanel)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center"
                        >
                            <FiSettings className="h-4 w-4 mr-2" />
                            Manager
                        </button>
                    )}
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                        <FiRefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <ConnectionStatsCards stats={stats} metrics={metrics} />

            {/* Manager Panel (Admin only) */}
            {isSuperAdmin && showManagerPanel && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">Connection Manager Actions</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                These actions affect database connections globally. Use with caution.
                            </p>
                            <div className="mt-3 flex space-x-3">
                                <button
                                    onClick={handleCloseIdle}
                                    disabled={managerLoading}
                                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                    Close Idle (30m)
                                </button>
                                <button
                                    onClick={handleRecycleAll}
                                    disabled={managerLoading}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Recycle All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Chart */}
            {chartData.length > 0 && (
                <div className="mb-6">
                    <ConnectionHealthChart
                        data={chartData}
                        title="Connection Pool Trends"
                        type="area"
                    />
                </div>
            )}

            {/* Connections Table */}
            <ConnectionTable
                connections={filteredConnections}
                onRefresh={refresh}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
            />

            {/* Metrics Summary (Admin only) */}
            {isSuperAdmin && metrics && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <dt className="text-sm font-medium text-gray-500">Avg Response Time</dt>
                        <dd className="mt-1 text-xl font-semibold text-gray-900">
                            {metrics.avg_response_time_ms || '-'} ms
                        </dd>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <dt className="text-sm font-medium text-gray-500">Max Concurrent</dt>
                        <dd className="mt-1 text-xl font-semibold text-gray-900">
                            {metrics.max_concurrent_connections || 0}
                        </dd>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <dt className="text-sm font-medium text-gray-500">Last Hour</dt>
                        <dd className="mt-1 text-xl font-semibold text-gray-900">
                            {metrics.connections_last_hour || 0}
                        </dd>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <dt className="text-sm font-medium text-gray-500">Last 24h</dt>
                        <dd className="mt-1 text-xl font-semibold text-gray-900">
                            {metrics.connections_last_24h || 0}
                        </dd>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectionDashboardPage;
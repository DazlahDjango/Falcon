import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiRefreshCw, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ConnectionTable from '../../../components/tenant/connection/ConnectionTable';
import { useConnections } from '../../../hooks/tenant';

const TenantConnectionsPage = () => {
    const { tenantId } = useParams();
    const [filterStatus, setFilterStatus] = useState('');

    const {
        filteredConnections,
        stats,
        loading,
        refresh,
        updateFilters,
    } = useConnections({ tenantId, autoRefresh: true });

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        updateFilters({ status: status || undefined });
    };

    const handleViewDetails = (connectionId) => {
        // Navigate to connection detail or open modal
        console.log('View connection:', connectionId);
    };

    const handleUpdateStatus = async (connectionId, status) => {
        // Implement status update
        console.log('Update connection:', connectionId, status);
        await refresh();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tenant Connections</h1>
                <p className="text-gray-600 mt-1">
                    Monitor database connections for this tenant
                </p>
            </div>

            {/* Filter Bar */}
            <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleFilterChange('')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            !filterStatus
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        onClick={() => handleFilterChange('active')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filterStatus === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Active ({stats.active})
                    </button>
                    <button
                        onClick={() => handleFilterChange('idle')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filterStatus === 'idle'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Idle ({stats.idle})
                    </button>
                    <button
                        onClick={() => handleFilterChange('error')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filterStatus === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Error ({stats.error})
                    </button>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center text-sm"
                >
                    <FiRefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Connections</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <FiActivity className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Healthy</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.total - stats.error}
                            </p>
                        </div>
                        <FiCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Errors</p>
                            <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                        </div>
                        <FiXCircle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Idle Connections</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.idle}</p>
                        </div>
                        <FiActivity className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Connections Table */}
            <ConnectionTable
                connections={filteredConnections}
                onRefresh={refresh}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
            />
        </div>
    );
};

export default TenantConnectionsPage;
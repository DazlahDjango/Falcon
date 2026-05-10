import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiRefreshCw, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ConnectionTable from '../../../components/tenant/connection/ConnectionTable';
import { useConnections } from '../../../hooks/tenant';

export const TenantConnectionsPage = () => {
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
        console.log('View connection:', connectionId);
    };

    const handleUpdateStatus = async (connectionId, status) => {
        console.log('Update connection:', connectionId, status);
        await refresh();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Database Connections
                    </h1>
                    <p className="text-slate-500 mt-2 flex items-center gap-2">
                        <FiActivity className="text-blue-500" />
                        Real-time monitoring of tenant connection pooling
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="group px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-4 w-4 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    <span className="font-semibold text-sm">Refresh Stream</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <FiActivity className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">LIVE</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Pool Size</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">HEALTHY</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Active Connections</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.active}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <FiClock className="h-6 w-6 text-amber-600" />
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">IDLE</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Idle Connections</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.idle}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <FiXCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">CRITICAL</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Error States</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.error}</p>
                </div>
            </div>

            {/* Filter and Content Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-bottom border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200">
                        <button
                            onClick={() => handleFilterChange('')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                !filterStatus ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleFilterChange('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                filterStatus === 'active' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => handleFilterChange('idle')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                filterStatus === 'idle' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Idle
                        </button>
                        <button
                            onClick={() => handleFilterChange('error')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                filterStatus === 'error' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Error
                        </button>
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

export default TenantConnectionsPage;
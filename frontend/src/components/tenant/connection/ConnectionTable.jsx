// frontend/src/components/tenant/connections/ConnectionTable.jsx
import React, { useState } from 'react';
import { FiMoreVertical, FiCheckCircle, FiXCircle, FiClock, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
    const config = {
        active: { label: 'Active', color: 'green', icon: FiActivity },
        idle: { label: 'Idle', color: 'yellow', icon: FiClock },
        closed: { label: 'Closed', color: 'gray', icon: FiXCircle },
        error: { label: 'Error', color: 'red', icon: FiXCircle },
    };
    
    const { label, color, icon: Icon } = config[status] || config.closed;
    
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            <Icon className="h-3 w-3 mr-1" />
            {label}
        </span>
    );
};

const ConnectionTable = ({ connections, onRefresh, onViewDetails, onUpdateStatus, loading }) => {
    const [actionMenu, setActionMenu] = useState(null);

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Never';
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (connections.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                <p className="mt-1 text-sm text-gray-500">No active database connections found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Connection ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tenant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Connected
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Used
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Idle Duration
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {connections.map((connection) => (
                            <tr key={connection.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                    {connection.connection_id?.slice(0, 12)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {connection.tenant_name || connection.tenant_id?.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={connection.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTime(connection.connected_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTime(connection.last_used_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {connection.idle_duration_seconds
                                        ? `${Math.floor(connection.idle_duration_seconds / 60)}m ${connection.idle_duration_seconds % 60}s`
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onViewDetails(connection.id)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        View
                                    </button>
                                    {connection.status !== 'closed' && (
                                        <button
                                            onClick={() => onUpdateStatus(connection.id, 'closed')}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Close
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConnectionTable;
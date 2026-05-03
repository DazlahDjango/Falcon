// frontend/src/components/tenant/dashboard/TenantResourceSummary.jsx
import React from 'react';

export const TenantResourceSummary = ({ resources, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const totalUsers = resources?.totalUsers || 0;
    const totalStorage = resources?.totalStorageMB || 0;
    const totalApiCalls = resources?.totalApiCalls || 0;

    const formatStorage = (mb) => {
        if (mb < 1024) return `${mb} MB`;
        if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${(mb / (1024 * 1024)).toFixed(1)} TB`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Resource Usage Summary</h3>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-medium">{totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((totalUsers / 10000) * 100, 100)}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total Storage</span>
                        <span className="font-medium">{formatStorage(totalStorage)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((totalStorage / 102400) * 100, 100)}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">API Calls (Today)</span>
                        <span className="font-medium">{totalApiCalls.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((totalApiCalls / 100000) * 100, 100)}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
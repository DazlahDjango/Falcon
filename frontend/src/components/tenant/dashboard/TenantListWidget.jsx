// frontend/src/components/tenant/dashboard/TenantListWidget.jsx
import React from 'react';
import { TenantStatusBadge } from '../common/TenantStatusBadge';

export const TenantListWidget = ({ tenants, onViewAll, onSelectTenant, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const recentTenants = tenants?.slice(0, 5);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Recent Tenants</h3>
                <button onClick={onViewAll} className="text-sm text-blue-600 hover:text-blue-800">
                    View All →
                </button>
            </div>
            <div className="divide-y divide-gray-100">
                {recentTenants?.map(tenant => (
                    <div
                        key={tenant.id}
                        onClick={() => onSelectTenant?.(tenant.id)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium text-gray-900">{tenant.name}</div>
                                <div className="text-xs text-gray-500">{tenant.slug}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <TenantStatusBadge status={tenant.status} size="sm" />
                                <span className="text-xs text-gray-400">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {(!recentTenants || recentTenants.length === 0) && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No tenants found
                    </div>
                )}
            </div>
        </div>
    );
};
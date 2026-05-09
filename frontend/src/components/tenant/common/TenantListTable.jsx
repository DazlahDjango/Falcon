// frontend/src/components/tenant/common/TenantListTable.jsx 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TenantStatusBadge from './TenantStatusBadge';

export const TenantListTable = ({ tenants, loading, onEdit, onDelete, onSuspend, onActivate }) => {
    const navigate = useNavigate();

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading tenants...</div>;
    }

    if (!tenants || tenants.length === 0) {
        return <div className="text-center py-8 text-gray-500">No tenants found</div>;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {tenant.name}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{tenant.slug}</td>
                            <td className="px-6 py-4 capitalize">{tenant.subscription_plan}</td>
                            <td className="px-6 py-4">
                                <TenantStatusBadge status={tenant.is_active ? 'active' : 'inactive'} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(tenant.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 space-x-2">
                                <button onClick={() => onEdit?.(tenant.id)} className="text-blue-600 hover:text-blue-800 text-sm">
                                    Edit
                                </button>
                                {tenant.is_active ? (
                                    <button onClick={() => onSuspend?.(tenant.id)} className="text-yellow-600 hover:text-yellow-800 text-sm">
                                        Suspend
                                    </button>
                                ) : (
                                    <button onClick={() => onActivate?.(tenant.id)} className="text-green-600 hover:text-green-800 text-sm">
                                        Activate
                                    </button>
                                )}
                                <button onClick={() => onDelete?.(tenant.id)} className="text-red-600 hover:text-red-800 text-sm">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

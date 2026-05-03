// frontend/src/components/tenant/tenant/TenantListTable.jsx
import React from 'react';
import { TenantStatusBadge } from '../common/TenantStatusBadge';
import './tenant.css';

export const TenantListTable = ({ tenants, onView, onEdit, onDelete, onSuspend, onActivate, loading = false }) => {
    if (loading) {
        return (
            <div className="tenant-table-container">
                <div className="p-8 text-center text-gray-500">Loading tenants...</div>
            </div>
        );
    }

    if (!tenants || tenants.length === 0) {
        return (
            <div className="tenant-table-container">
                <div className="p-8 text-center text-gray-500">No tenants found</div>
            </div>
        );
    }

    const getPlanClass = (plan) => {
        switch (plan) {
            case 'trial': return 'tenant-plan-trial';
            case 'basic': return 'tenant-plan-basic';
            case 'professional': return 'tenant-plan-professional';
            case 'enterprise': return 'tenant-plan-enterprise';
            default: return 'tenant-plan-basic';
        }
    };

    return (
        <div className="tenant-table-container">
            <div className="overflow-x-auto">
                <table className="tenant-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Users</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} onClick={() => onView?.(tenant.id)} style={{ cursor: 'pointer' }}>
                                <td className="font-medium text-gray-900">{tenant.name}</td>
                                <td>
                                    <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">{tenant.slug}</code>
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanClass(tenant.subscription_plan)}`}>
                                        {tenant.subscription_plan?.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <TenantStatusBadge status={tenant.status} size="sm" />
                                </td>
                                <td>{tenant.current_users || 0}</td>
                                <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onEdit?.(tenant.id)}
                                            className="tenant-action-button tenant-action-edit"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        {tenant.status === 'active' ? (
                                            <button
                                                onClick={() => onSuspend?.(tenant.id)}
                                                className="tenant-action-button tenant-action-suspend"
                                                title="Suspend"
                                            >
                                                ⛔
                                            </button>
                                        ) : tenant.status === 'suspended' ? (
                                            <button
                                                onClick={() => onActivate?.(tenant.id)}
                                                className="tenant-action-button tenant-action-activate"
                                                title="Activate"
                                            >
                                                ✓
                                            </button>
                                        ) : null}
                                        <button
                                            onClick={() => onDelete?.(tenant.id)}
                                            className="tenant-action-button tenant-action-delete"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
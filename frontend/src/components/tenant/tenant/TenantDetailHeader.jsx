// frontend/src/components/tenant/tenant/TenantDetailHeader.jsx
import React from 'react';
import { TenantStatusBadge } from '../common/TenantStatusBadge';
import './tenant.css';

export const TenantDetailHeader = ({ tenant, onEdit, onSuspend, onActivate, onDelete }) => {
    if (!tenant) return null;

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
        <div className="tenant-header">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {tenant.logo ? (
                        <img src={tenant.logo} alt={tenant.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            {tenant.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="tenant-header-title">{tenant.name}</h1>
                            <TenantStatusBadge status={tenant.status} size="md" />
                        </div>
                        <p className="tenant-header-subtitle">
                            <code className="bg-gray-100 px-1 rounded">{tenant.slug}</code>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {tenant.status === 'active' ? (
                        <button
                            onClick={() => onSuspend?.(tenant.id)}
                            className="tenant-action-button tenant-action-suspend px-4 py-2"
                        >
                            Suspend
                        </button>
                    ) : tenant.status === 'suspended' ? (
                        <button
                            onClick={() => onActivate?.(tenant.id)}
                            className="tenant-action-button tenant-action-activate px-4 py-2"
                        >
                            Activate
                        </button>
                    ) : null}
                    <button
                        onClick={() => onEdit?.(tenant.id)}
                        className="tenant-action-button tenant-action-edit px-4 py-2"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(tenant.id)}
                        className="tenant-action-button tenant-action-delete px-4 py-2"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Plan:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanClass(tenant.subscription_plan)}`}>
                        {tenant.subscription_plan?.toUpperCase()}
                    </span>
                </div>
                {tenant.subscription_expires_at && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Expires:</span>
                        <span className="text-sm">{new Date(tenant.subscription_expires_at).toLocaleDateString()}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm">{new Date(tenant.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};
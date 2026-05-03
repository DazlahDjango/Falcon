// frontend/src/components/tenant/common/TenantCard.jsx
import React from 'react';
import { TenantStatusBadge } from './TenantStatusBadge';
import { SUBSCRIPTION_PLAN } from '../../../config/constants/tenantConstants';

const planColors = {
    [SUBSCRIPTION_PLAN.TRIAL]: 'bg-purple-100 text-purple-800',
    [SUBSCRIPTION_PLAN.BASIC]: 'bg-blue-100 text-blue-800',
    [SUBSCRIPTION_PLAN.PROFESSIONAL]: 'bg-green-100 text-green-800',
    [SUBSCRIPTION_PLAN.ENTERPRISE]: 'bg-orange-100 text-orange-800',
};

export const TenantCard = ({ tenant, onClick, onEdit, onDelete }) => {
    const handleClick = () => {
        if (onClick) onClick(tenant.id);
    };

    const planColor = planColors[tenant.subscription_plan] || planColors[SUBSCRIPTION_PLAN.BASIC];

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {tenant.logo ? (
                            <img src={tenant.logo} alt={tenant.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {tenant.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h3 className="font-semibold text-lg">{tenant.name}</h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                            <span className="font-medium">Slug:</span>
                            <code className="bg-gray-100 px-1 rounded">{tenant.slug}</code>
                        </p>
                        {tenant.contact_email && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                <span>{tenant.contact_email}</span>
                            </p>
                        )}
                        <p className="flex items-center gap-2">
                            <span className="font-medium">Plan:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColor}`}>
                                {tenant.subscription_plan?.toUpperCase()}
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <TenantStatusBadge status={tenant.status} size="sm" />
                        </p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(tenant.id); }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            aria-label="Edit"
                        >
                            ✏️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(tenant.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(tenant.created_at).toLocaleDateString()}</span>
                    {tenant.current_users !== undefined && (
                        <span>Users: {tenant.current_users}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
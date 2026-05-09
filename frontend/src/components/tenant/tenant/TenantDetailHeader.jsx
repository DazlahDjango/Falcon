// frontend/src/components/tenant/TenantDetailHeader.jsx
import React from 'react';
import TenantStatusBadge from '../common/TenantStatusBadge';
import './tenant.css';

const TenantDetailHeader = ({ tenant, onEdit, onSuspend, onActivate, onDelete }) => {
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

    const isActive = tenant.is_active === true;
    const isSuspended = tenant.is_active === false;

    return (
        <div className="tenant-detail-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {tenant.logo ? (
                        <img 
                            src={tenant.logo} 
                            alt={tenant.name} 
                            className="w-16 h-16 rounded-full object-cover" 
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            {tenant.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h1 className="tenant-header-title">{tenant.name}</h1>
                            <TenantStatusBadge 
                                isActive={tenant.is_active}
                                isVerified={tenant.is_verified}
                                subscriptionPlan={tenant.subscription_plan}
                            />
                        </div>
                        <p className="tenant-header-subtitle">
                            <code className="bg-gray-100 px-1 rounded">{tenant.slug}</code>
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isActive && (
                        <button onClick={() => onSuspend?.(tenant.id)} className="tenant-action-button tenant-action-suspend">
                            Suspend
                        </button>
                    )}
                    {isSuspended && (
                        <button onClick={() => onActivate?.(tenant.id)} className="tenant-action-button tenant-action-activate">
                            Activate
                        </button>
                    )}
                    <button onClick={() => onEdit?.(tenant.id)} className="tenant-action-button tenant-action-edit">
                        Edit
                    </button>
                    <button onClick={() => onDelete?.(tenant.id)} className="tenant-action-button tenant-action-delete">
                        Delete
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Plan:</span>
                    <span className={getPlanClass(tenant.subscription_plan)}>
                        {tenant.subscription_plan?.toUpperCase()}
                    </span>
                </div>
                {tenant.subscription_expires_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Expires:</span>
                        <span style={{ fontSize: '0.875rem' }}>
                            {new Date(tenant.subscription_expires_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Created:</span>
                    <span style={{ fontSize: '0.875rem' }}>
                        {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Verified:</span>
                    <span style={{ fontSize: '0.875rem' }}>
                        {tenant.is_verified ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TenantDetailHeader;
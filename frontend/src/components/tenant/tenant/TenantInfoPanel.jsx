// frontend/src/components/tenant/TenantInfoPanel.jsx
import React from 'react';
import './tenant.css';

const TenantInfoPanel = ({ tenant }) => {
    if (!tenant) return null;

    // ✅ Use is_active for status display
    const getStatusDisplay = () => {
        if (!tenant.is_active) return 'Suspended';
        if (!tenant.is_verified) return 'Unverified';
        if (tenant.subscription_plan === 'trial') return 'Trial';
        return 'Active';
    };

    return (
        <div className="tenant-info-panel">
            <h3 className="tenant-panel-title">Information</h3>
            <div className="tenant-info-grid">
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Tenant ID</span>
                    <span className="tenant-info-value font-mono text-sm">{tenant.id}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Status</span>
                    <span className="tenant-info-value">{getStatusDisplay()}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Verified</span>
                    <span className="tenant-info-value">{tenant.is_verified ? 'Yes' : 'No'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Domain</span>
                    <span className="tenant-info-value">{tenant.domain || '-'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Subscription Plan</span>
                    <span className="tenant-info-value capitalize">{tenant.subscription_plan}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Created At</span>
                    <span className="tenant-info-value">
                        {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                </div>
                {tenant.provisioned_at && (
                    <div className="tenant-info-item">
                        <span className="tenant-info-label">Provisioned At</span>
                        <span className="tenant-info-value">
                            {new Date(tenant.provisioned_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantInfoPanel;
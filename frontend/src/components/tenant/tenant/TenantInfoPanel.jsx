import React from 'react';
import './tenant.css';

const TenantInfoPanel = ({ tenant }) => {
    if (!tenant) return null;

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
                    <span className="tenant-info-value">{tenant.status}</span>
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
                    <span className="tenant-info-value">{new Date(tenant.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TenantInfoPanel;

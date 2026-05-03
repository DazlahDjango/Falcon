// frontend/src/components/tenant/tenant/TenantInfoPanel.jsx
import React from 'react';
import './tenant.css';

export const TenantInfoPanel = ({ tenant }) => {
    if (!tenant) return null;

    return (
        <div className="tenant-detail-card">
            <div className="tenant-detail-card-header">
                <h3 className="tenant-detail-card-title">General Information</h3>
            </div>
            <div className="tenant-detail-card-content">
                <div className="tenant-info-grid">
                    <div className="tenant-info-section">
                        <div>
                            <p className="tenant-info-label">Tenant Name</p>
                            <p className="tenant-info-value">{tenant.name}</p>
                        </div>
                        <div>
                            <p className="tenant-info-label">Slug</p>
                            <p className="tenant-info-value">
                                <code className="bg-gray-100 px-1 rounded">{tenant.slug}</code>
                            </p>
                        </div>
                        <div>
                            <p className="tenant-info-label">Domain</p>
                            <p className="tenant-info-value">{tenant.domain || 'Not configured'}</p>
                        </div>
                    </div>

                    <div className="tenant-info-section">
                        <div>
                            <p className="tenant-info-label">Subscription Plan</p>
                            <p className="tenant-info-value capitalize">{tenant.subscription_plan}</p>
                        </div>
                        <div>
                            <p className="tenant-info-label">Subscription Status</p>
                            <p className="tenant-info-value">
                                {tenant.subscription_expires_at
                                    ? new Date(tenant.subscription_expires_at) > new Date()
                                        ? 'Active'
                                        : 'Expired'
                                    : 'N/A'}
                            </p>
                        </div>
                        {tenant.subscription_expires_at && (
                            <div>
                                <p className="tenant-info-label">Expires On</p>
                                <p className="tenant-info-value">{new Date(tenant.subscription_expires_at).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
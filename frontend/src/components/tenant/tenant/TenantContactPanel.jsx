// frontend/src/components/tenant/tenant/TenantContactPanel.jsx
import React from 'react';
import './tenant.css';

export const TenantContactPanel = ({ tenant }) => {
    if (!tenant) return null;

    return (
        <div className="tenant-detail-card">
            <div className="tenant-detail-card-header">
                <h3 className="tenant-detail-card-title">Contact Information</h3>
            </div>
            <div className="tenant-detail-card-content">
                <div className="tenant-info-grid">
                    <div className="tenant-info-section">
                        <div>
                            <p className="tenant-info-label">Email</p>
                            <p className="tenant-info-value">{tenant.contact_email || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="tenant-info-label">Phone</p>
                            <p className="tenant-info-value">{tenant.contact_phone || 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="tenant-info-section">
                        <div>
                            <p className="tenant-info-label">Address</p>
                            <p className="tenant-info-value">{tenant.address || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="tenant-info-label">City</p>
                            <p className="tenant-info-value">{tenant.city || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="tenant-info-label">Country</p>
                            <p className="tenant-info-value">{tenant.country || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
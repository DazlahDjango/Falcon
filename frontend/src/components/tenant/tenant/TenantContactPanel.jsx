import React from 'react';
import './tenant.css';

const TenantContactPanel = ({ tenant }) => {
    if (!tenant) return null;

    return (
        <div className="tenant-contact-panel">
            <h3 className="tenant-panel-title">Contact</h3>
            <div className="tenant-info-grid">
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Email</span>
                    <span className="tenant-info-value">{tenant.contact_email || '-'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Phone</span>
                    <span className="tenant-info-value">{tenant.contact_phone || '-'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Address</span>
                    <span className="tenant-info-value">{tenant.address || '-'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">City</span>
                    <span className="tenant-info-value">{tenant.city || '-'}</span>
                </div>
                <div className="tenant-info-item">
                    <span className="tenant-info-label">Country</span>
                    <span className="tenant-info-value">{tenant.country || '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default TenantContactPanel;

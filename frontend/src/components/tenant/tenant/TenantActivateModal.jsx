import React from 'react';
import './tenant.css';

const TenantActivateModal = ({ isOpen, onClose, onConfirm, tenantName }) => {
    if (!isOpen) return null;

    return (
        <div className="tenant-modal-overlay">
            <div className="tenant-modal">
                <div className="tenant-modal-header">
                    <h3 className="tenant-modal-title">Activate Tenant</h3>
                    <button onClick={onClose} className="tenant-modal-close">&times;</button>
                </div>
                <div className="tenant-modal-body">
                    <p>Are you sure you want to activate <strong>{tenantName}</strong>?</p>
                </div>
                <div className="tenant-modal-footer">
                    <button onClick={onClose} className="tenant-btn tenant-btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="tenant-btn tenant-btn-success">Activate</button>
                </div>
            </div>
        </div>
    );
};

export default TenantActivateModal;

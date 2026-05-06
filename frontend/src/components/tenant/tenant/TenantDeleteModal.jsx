import React from 'react';
import './tenant.css';

const TenantDeleteModal = ({ isOpen, onClose, onConfirm, tenantName }) => {
    if (!isOpen) return null;

    return (
        <div className="tenant-modal-overlay">
            <div className="tenant-modal">
                <div className="tenant-modal-header">
                    <h3 className="tenant-modal-title">Delete Tenant</h3>
                    <button onClick={onClose} className="tenant-modal-close">&times;</button>
                </div>
                <div className="tenant-modal-body">
                    <p>Are you sure you want to delete <strong>{tenantName}</strong>?</p>
                    <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
                </div>
                <div className="tenant-modal-footer">
                    <button onClick={onClose} className="tenant-btn tenant-btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="tenant-btn tenant-btn-danger">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default TenantDeleteModal;

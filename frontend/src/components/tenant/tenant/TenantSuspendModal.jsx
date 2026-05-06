import React, { useState } from 'react';
import './tenant.css';

const TenantSuspendModal = ({ isOpen, onClose, onConfirm, tenantName }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="tenant-modal-overlay">
            <div className="tenant-modal">
                <div className="tenant-modal-header">
                    <h3 className="tenant-modal-title">Suspend Tenant</h3>
                    <button onClick={onClose} className="tenant-modal-close">&times;</button>
                </div>
                <div className="tenant-modal-body">
                    <p>Are you sure you want to suspend <strong>{tenantName}</strong>?</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for suspension (optional)"
                        className="tenant-textarea mt-3"
                        rows="3"
                    />
                </div>
                <div className="tenant-modal-footer">
                    <button onClick={onClose} className="tenant-btn tenant-btn-secondary">Cancel</button>
                    <button onClick={handleConfirm} className="tenant-btn tenant-btn-warning">Suspend</button>
                </div>
            </div>
        </div>
    );
};

export default TenantSuspendModal;

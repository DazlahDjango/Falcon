import React, { useState } from 'react';
import './tenant.css';

const TenantUpgradeModal = ({ isOpen, onClose, onConfirm, tenantName, currentPlan }) => {
    const [plan, setPlan] = useState('professional');
    if (!isOpen) return null;

    return (
        <div className="tenant-modal-overlay">
            <div className="tenant-modal">
                <div className="tenant-modal-header">
                    <h3 className="tenant-modal-title">Upgrade Plan</h3>
                    <button onClick={onClose} className="tenant-modal-close">&times;</button>
                </div>
                <div className="tenant-modal-body">
                    <p>Current plan: <strong>{currentPlan}</strong></p>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)} className="tenant-select mt-3">
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
                <div className="tenant-modal-footer">
                    <button onClick={onClose} className="tenant-btn tenant-btn-secondary">Cancel</button>
                    <button onClick={() => onConfirm(plan)} className="tenant-btn tenant-btn-primary">Upgrade</button>
                </div>
            </div>
        </div>
    );
};

export default TenantUpgradeModal;

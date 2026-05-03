// frontend/src/components/tenant/domains/DomainVerifyModal.jsx
import React from 'react';
import { DomainVerificationInfo } from './DomainVerificationInfo';
import './domains.css';

export const DomainVerifyModal = ({ isOpen, onClose, onConfirm, domain, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="domain-modal-overlay" onClick={onClose}>
            <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
                <div className="domain-modal-header">
                    <h3 className="domain-modal-title">Verify Domain</h3>
                    <button onClick={onClose} className="domain-modal-close">✕</button>
                </div>

                <div className="domain-modal-body">
                    <p>Verify ownership of <strong>{domain?.domain}</strong></p>
                    <DomainVerificationInfo domain={domain} />
                </div>

                <div className="domain-modal-footer">
                    <button onClick={onClose} className="domain-btn domain-btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="domain-btn domain-btn-primary"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};
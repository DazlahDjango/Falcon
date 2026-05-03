// frontend/src/components/tenant/domains/DomainDeleteModal.jsx
import React from 'react';
import './domains.css';

export const DomainDeleteModal = ({ isOpen, onClose, onConfirm, domainName, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="domain-modal-overlay" onClick={onClose}>
            <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
                <div className="domain-modal-header">
                    <h3 className="domain-modal-title">Delete Domain</h3>
                    <button onClick={onClose} className="domain-modal-close">✕</button>
                </div>

                <div className="domain-modal-body">
                    <p>Are you sure you want to delete <strong>{domainName}</strong>?</p>
                    <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                </div>

                <div className="domain-modal-footer">
                    <button onClick={onClose} className="domain-btn domain-btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="domain-btn domain-btn-danger"
                    >
                        {isLoading ? 'Deleting...' : 'Delete Domain'}
                    </button>
                </div>
            </div>
        </div>
    );
};
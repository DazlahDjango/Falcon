// frontend/src/components/tenant/tenant/TenantActivateModal.jsx
import React from 'react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import './tenant.css';

export const TenantActivateModal = ({ isOpen, onClose, onConfirm, tenantName, isLoading = false }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Activate Tenant"
            message={
                <div>
                    <p>Are you sure you want to activate <strong>{tenantName}</strong>?</p>
                    <p className="mt-2 text-green-600">Activated tenants will have full access to the system.</p>
                </div>
            }
            confirmText="Activate Tenant"
            type="success"
            isLoading={isLoading}
        />
    );
};
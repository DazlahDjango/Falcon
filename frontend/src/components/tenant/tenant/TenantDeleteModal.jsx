// frontend/src/components/tenant/tenant/TenantDeleteModal.jsx
import React, { useState } from 'react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import './tenant.css';

export const TenantDeleteModal = ({ isOpen, onClose, onConfirm, tenantName, isLoading = false }) => {
    const [confirmName, setConfirmName] = useState('');

    const handleConfirm = () => {
        if (confirmName === tenantName) {
            onConfirm();
        }
    };

    const handleClose = () => {
        setConfirmName('');
        onClose();
    };

    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title="Delete Tenant"
            message={
                <div>
                    <p>Are you sure you want to delete <strong>{tenantName}</strong>?</p>
                    <p className="mt-2 text-red-600">This action cannot be undone. All data associated with this tenant will be permanently deleted.</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <strong>{tenantName}</strong> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                            placeholder={`Type "${tenantName}" to confirm`}
                        />
                    </div>
                </div>
            }
            confirmText="Delete Permanently"
            type="danger"
            isLoading={isLoading}
            confirmDisabled={confirmName !== tenantName}
        />
    );
};
// frontend/src/components/tenant/tenant/TenantSuspendModal.jsx
import React, { useState } from 'react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import './tenant.css';

export const TenantSuspendModal = ({ isOpen, onClose, onConfirm, tenantName, isLoading = false }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title="Suspend Tenant"
            message={
                <div>
                    <p>Are you sure you want to suspend <strong>{tenantName}</strong>?</p>
                    <p className="mt-2 text-yellow-600">Suspended tenants will not be able to access the system.</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason (Optional):
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="Enter reason for suspension..."
                        />
                    </div>
                </div>
            }
            confirmText="Suspend Tenant"
            type="warning"
            isLoading={isLoading}
        />
    );
};
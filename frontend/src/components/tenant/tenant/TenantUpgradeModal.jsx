// frontend/src/components/tenant/tenant/TenantUpgradeModal.jsx
import React, { useState } from 'react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import './tenant.css';

export const TenantUpgradeModal = ({ isOpen, onClose, onConfirm, tenantName, currentPlan, isLoading = false }) => {
    const [selectedPlan, setSelectedPlan] = useState('professional');

    const plans = [
        { value: 'basic', label: 'Basic', price: '$49/month', limits: '50 users, 5GB storage' },
        { value: 'professional', label: 'Professional', price: '$99/month', limits: '500 users, 50GB storage' },
        { value: 'enterprise', label: 'Enterprise', price: 'Custom', limits: 'Unlimited users, custom storage' },
    ];

    const handleConfirm = () => {
        onConfirm(selectedPlan);
    };

    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Upgrade Subscription"
            message={
                <div>
                    <p>Upgrade <strong>{tenantName}</strong> from <strong>{currentPlan}</strong> to a higher plan.</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select New Plan:
                        </label>
                        <div className="space-y-2">
                            {plans.map(plan => (
                                <label key={plan.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="plan"
                                        value={plan.value}
                                        checked={selectedPlan === plan.value}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{plan.label}</div>
                                        <div className="text-sm text-gray-500">{plan.price}</div>
                                        <div className="text-xs text-gray-400">{plan.limits}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            }
            confirmText="Upgrade Plan"
            type="info"
            isLoading={isLoading}
        />
    );
};
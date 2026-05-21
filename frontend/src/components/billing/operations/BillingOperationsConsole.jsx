import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw, FiDollarSign, FiRadio } from 'react-icons/fi';
import { usePermissionContext } from '../../../contexts/accounts/PermissionContext';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import { useBillingSystemSettings } from '../../../hooks/billing/useBillingSystemSettings';

const TABS = [
    { id: 'payments', label: 'Payments', icon: FiDollarSign },
    { id: 'realtime', label: 'Real-time', icon: FiRadio },
];

const BillingOperationsConsole = () => {
    const dispatch = useDispatch();
    const { hasRole } = usePermissionContext();
    const isSuperAdmin = hasRole('super_admin');
    const [activeTab, setActiveTab] = useState('payments');
    const { form, version, isLoading, isSaving, save, reset, updateSection } = useBillingSystemSettings(isSuperAdmin);

    if (!isSuperAdmin) {
        return <div className="p-6"><p>Billing platform settings require super administrator access.</p></div>;
    }

    const handleSave = async () => {
        try {
            const data = await save();
            dispatch(showAlert({ type: 'success', message: `Billing settings saved (v${data?.version ?? version})` }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save billing settings' }));
        }
    };

    if (isLoading || !form) {
        return <div className="p-6"><SkeletonLoader type="card" count={2} /></div>;
    }

    return (
        <div className="billing-operations-console">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Billing Operations</h1>
                    <p className="text-sm text-gray-500">Payments, tax, invoices, webhooks (v{version})</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={reset} disabled={isSaving}>
                        <FiRefreshCw className="inline mr-1" /> Reset
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        <FiSave className="inline mr-1" /> Save
                    </button>
                </div>
            </div>
            <nav className="flex gap-2 border-b mb-6">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-2 text-sm ${activeTab === t.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>
            <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'payments' && (
                    <div className="space-y-3 max-w-md">
                        <label className="block text-sm">Trial days</label>
                        <input
                            type="number"
                            className="form-input"
                            value={form.payments.trial_days}
                            onChange={(e) => updateSection('payments', 'trial_days', Number(e.target.value))}
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.payments.auto_renew}
                                onChange={(e) => updateSection('payments', 'auto_renew', e.target.checked)}
                            />
                            Auto-renew subscriptions
                        </label>
                    </div>
                )}
                {activeTab === 'realtime' && (
                    <div className="space-y-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.realtime.websocket_enabled}
                                onChange={(e) => updateSection('realtime', 'websocket_enabled', e.target.checked)}
                            />
                            WebSocket enabled
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.realtime.push_subscription_updates}
                                onChange={(e) => updateSection('realtime', 'push_subscription_updates', e.target.checked)}
                            />
                            Push subscription updates
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingOperationsConsole;

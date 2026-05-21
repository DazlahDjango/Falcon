import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw, FiShield, FiRadio, FiDatabase } from 'react-icons/fi';
import { useTenantSystemSettings } from '../../../hooks/tenant/useTenantSystemSettings';
import { usePermissionContext } from '../../../contexts/accounts/PermissionContext';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const TABS = [
    { id: 'quotas', label: 'Quotas & live counts', icon: FiDatabase },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'realtime', label: 'Real-time', icon: FiRadio },
];

const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
    </label>
);

const TenantOperationsConsole = () => {
    const dispatch = useDispatch();
    const { hasRole } = usePermissionContext();
    const isSuperAdmin = hasRole('super_admin');
    const [activeTab, setActiveTab] = useState('quotas');
    const {
        form, version, isLoading, isSaving, save, reset, updateSection,
    } = useTenantSystemSettings(isSuperAdmin);

    if (!isSuperAdmin) {
        return (
            <div className="p-6">
                <p>Tenant platform settings are managed by a super administrator.</p>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            const data = await save();
            dispatch(showAlert({
                type: 'success',
                message: `Tenant settings saved (v${data?.version ?? version})`,
            }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save tenant settings' }));
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset tenant platform settings to defaults?')) return;
        try {
            await reset();
            dispatch(showAlert({ type: 'success', message: 'Tenant settings reset' }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset tenant settings' }));
        }
    };

    if (isLoading || !form) {
        return <div className="p-6"><SkeletonLoader type="card" count={2} /></div>;
    }

    const renderTab = () => {
        if (activeTab === 'quotas') {
            return (
                <div className="space-y-3">
                    <Toggle
                        label="Sync live user/department/KPI counts from source apps"
                        checked={form.quotas.sync_live_counts}
                        onChange={(v) => updateSection('quotas', 'sync_live_counts', v)}
                    />
                    <Toggle
                        label="Reconcile counters when reading usage APIs"
                        checked={form.quotas.reconcile_on_usage_read}
                        onChange={(v) => updateSection('quotas', 'reconcile_on_usage_read', v)}
                    />
                    <Toggle
                        label="Block actions when quota exceeded"
                        checked={form.quotas.block_on_exceeded}
                        onChange={(v) => updateSection('quotas', 'block_on_exceeded', v)}
                    />
                    <label className="block text-sm font-medium">Warning threshold (%)</label>
                    <input
                        type="number"
                        className="form-input max-w-xs"
                        min={50}
                        max={99}
                        value={form.quotas.warn_threshold_percent}
                        onChange={(e) => updateSection('quotas', 'warn_threshold_percent', Number(e.target.value))}
                    />
                </div>
            );
        }
        if (activeTab === 'security') {
            return (
                <div className="space-y-3">
                    <Toggle
                        label="Require verified domain before SSO"
                        checked={form.security.require_verified_domain_for_sso}
                        onChange={(v) => updateSection('security', 'require_verified_domain_for_sso', v)}
                    />
                    <Toggle
                        label="Auto-suspend on subscription expiry"
                        checked={form.security.suspend_on_subscription_expiry}
                        onChange={(v) => updateSection('security', 'suspend_on_subscription_expiry', v)}
                    />
                    <Toggle
                        label="Audit tenant admin actions"
                        checked={form.security.audit_tenant_admin_actions}
                        onChange={(v) => updateSection('security', 'audit_tenant_admin_actions', v)}
                    />
                </div>
            );
        }
        return (
            <div className="space-y-3">
                <Toggle
                    label="WebSocket enabled"
                    checked={form.realtime.websocket_enabled}
                    onChange={(v) => updateSection('realtime', 'websocket_enabled', v)}
                />
                <Toggle
                    label="Push status changes"
                    checked={form.realtime.push_status_changes}
                    onChange={(v) => updateSection('realtime', 'push_status_changes', v)}
                />
                <Toggle
                    label="Push quota warnings"
                    checked={form.realtime.push_quota_warnings}
                    onChange={(v) => updateSection('realtime', 'push_quota_warnings', v)}
                />
                <Toggle
                    label="Push resource usage updates"
                    checked={form.realtime.push_resource_usage}
                    onChange={(v) => updateSection('realtime', 'push_resource_usage', v)}
                />
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Tenant Operations</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Platform isolation, live quota sync, and real-time tenant events (v{version})
                    </p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={isSaving}>
                        <FiRefreshCw className="inline mr-1" /> Reset
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        <FiSave className="inline mr-1" /> Save
                    </button>
                </div>
            </div>
            <nav className="flex gap-2 border-b mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        <tab.icon className="inline mr-1" />
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div className="bg-white rounded-lg shadow-sm p-6">{renderTab()}</div>
        </div>
    );
};

export default TenantOperationsConsole;

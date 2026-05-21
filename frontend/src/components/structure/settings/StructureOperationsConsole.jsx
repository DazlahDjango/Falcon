import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw, FiShield, FiRadio, FiGitBranch } from 'react-icons/fi';
import { useStructureSystemSettings } from '../../../hooks/structure/useStructureSystemSettings';
import { usePermissionContext } from '../../../contexts/accounts/PermissionContext';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const TABS = [
    { id: 'hierarchy', label: 'Hierarchy', icon: FiGitBranch },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'realtime', label: 'Real-time', icon: FiRadio },
];

const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
    </label>
);

const StructureOperationsConsole = () => {
    const dispatch = useDispatch();
    const { hasRole } = usePermissionContext();
    const isSuperAdmin = hasRole('super_admin');
    const [activeTab, setActiveTab] = useState('hierarchy');
    const {
        form, version, isLoading, isSaving, save, reset, updateSection,
    } = useStructureSystemSettings(isSuperAdmin);

    if (!isSuperAdmin) {
        return (
            <div className="p-6">
                <p>Structure platform settings are managed by a super administrator.</p>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            const data = await save();
            dispatch(showAlert({
                type: 'success',
                message: `Structure settings saved (v${data?.version ?? version})`,
            }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save structure settings' }));
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset structure platform settings to defaults?')) return;
        try {
            await reset();
            dispatch(showAlert({ type: 'success', message: 'Structure settings reset' }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset structure settings' }));
        }
    };

    if (isLoading || !form) {
        return <div className="p-6"><SkeletonLoader type="card" count={2} /></div>;
    }

    const renderTab = () => {
        if (activeTab === 'hierarchy') {
            return (
                <div className="space-y-3">
                    <label className="block text-sm font-medium">Maximum hierarchy depth</label>
                    <input
                        type="number"
                        className="form-input max-w-xs"
                        min={1}
                        max={32}
                        value={form.hierarchy.max_depth}
                        onChange={(e) => updateSection('hierarchy', 'max_depth', Number(e.target.value))}
                    />
                    <Toggle
                        label="Allow matrix (dotted-line) reporting"
                        checked={form.hierarchy.allow_matrix_reporting}
                        onChange={(v) => updateSection('hierarchy', 'allow_matrix_reporting', v)}
                    />
                    <Toggle
                        label="Cycle detection on save"
                        checked={form.hierarchy.cycle_detection_on_save}
                        onChange={(v) => updateSection('hierarchy', 'cycle_detection_on_save', v)}
                    />
                </div>
            );
        }
        if (activeTab === 'security') {
            return (
                <div className="space-y-3">
                    <Toggle
                        label="Enforce hierarchy access rules"
                        checked={form.security.hierarchy_access_enforced}
                        onChange={(v) => updateSection('security', 'hierarchy_access_enforced', v)}
                    />
                    <Toggle
                        label="Sensitivity classification"
                        checked={form.security.sensitivity_classification_enabled}
                        onChange={(v) => updateSection('security', 'sensitivity_classification_enabled', v)}
                    />
                    <Toggle
                        label="Scope enforcement on queries"
                        checked={form.security.scope_enforcement_enabled}
                        onChange={(v) => updateSection('security', 'scope_enforcement_enabled', v)}
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
                    label="Push department changes"
                    checked={form.realtime.push_department_changes}
                    onChange={(v) => updateSection('realtime', 'push_department_changes', v)}
                />
                <Toggle
                    label="Use Channels as primary transport"
                    checked={form.realtime.use_channels_primary}
                    onChange={(v) => updateSection('realtime', 'use_channels_primary', v)}
                />
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Structure Operations</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Org hierarchy policy, security, and live org events (v{version})
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

export default StructureOperationsConsole;

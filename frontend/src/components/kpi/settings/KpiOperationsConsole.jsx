import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw, FiSettings, FiCheckCircle, FiRadio } from 'react-icons/fi';
import { useKpiSystemSettings } from '../../../hooks/kpi/useKpiSystemSettings';
import { usePermissionContext } from '../../../contexts/accounts/PermissionContext';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import '../../../styles/kpi/settings.css';

const TABS = [
    { id: 'validation', label: 'Validation', icon: FiCheckCircle },
    { id: 'calculation', label: 'Calculation', icon: FiSettings },
    { id: 'realtime', label: 'Real-time', icon: FiRadio },
];

const KpiOperationsConsole = () => {
    const dispatch = useDispatch();
    const { hasRole } = usePermissionContext();
    const isSuperAdmin = hasRole('super_admin');
    const [activeTab, setActiveTab] = useState('validation');
    const {
        form,
        version,
        isLoading,
        isSaving,
        error,
        save,
        reset,
        updateSection,
    } = useKpiSystemSettings(isSuperAdmin);

    if (!isSuperAdmin) {
        return (
            <div className="kpi-settings-page">
                <p>KPI platform settings are managed by a super administrator.</p>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            const data = await save();
            dispatch(showAlert({
                type: 'success',
                message: `KPI settings saved (v${data?.version ?? version})`,
            }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save KPI settings' }));
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset KPI platform settings to canonical defaults?')) return;
        try {
            await reset();
            dispatch(showAlert({ type: 'success', message: 'KPI settings reset to defaults' }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset KPI settings' }));
        }
    };

    if (isLoading || !form) {
        return (
            <div className="kpi-settings-page">
                <SkeletonLoader type="card" count={2} />
            </div>
        );
    }

    const renderTab = () => {
        if (activeTab === 'validation') {
            return (
                <div className="kpi-settings-grid">
                    <div className="kpi-settings-card">
                        <h4>Submission deadlines</h4>
                        <label>Submission deadline (day of month)</label>
                        <input
                            type="number"
                            className="form-input"
                            min={1}
                            max={28}
                            value={form.validation.submission_deadline_day}
                            onChange={(e) => updateSection(
                                'validation',
                                'submission_deadline_day',
                                Number(e.target.value),
                            )}
                        />
                        <label>Supervisor review window (hours)</label>
                        <input
                            type="number"
                            className="form-input"
                            min={1}
                            value={form.validation.supervisor_review_hours}
                            onChange={(e) => updateSection(
                                'validation',
                                'supervisor_review_hours',
                                Number(e.target.value),
                            )}
                        />
                    </div>
                    <div className="kpi-settings-card">
                        <h4>Evidence & auto-approve</h4>
                        <label className="kpi-settings-toggle">
                            <input
                                type="checkbox"
                                checked={form.validation.require_evidence_for_financial}
                                onChange={(e) => updateSection(
                                    'validation',
                                    'require_evidence_for_financial',
                                    e.target.checked,
                                )}
                            />
                            Require evidence for financial KPIs
                        </label>
                    </div>
                </div>
            );
        }
        if (activeTab === 'calculation') {
            return (
                <div className="kpi-settings-grid">
                    <div className="kpi-settings-card">
                        <h4>Scores & traffic lights</h4>
                        <label className="kpi-settings-toggle">
                            <input
                                type="checkbox"
                                checked={form.calculation.recalculate_on_approve}
                                onChange={(e) => updateSection(
                                    'calculation',
                                    'recalculate_on_approve',
                                    e.target.checked,
                                )}
                            />
                            Recalculate on approve
                        </label>
                        <label className="kpi-settings-toggle">
                            <input
                                type="checkbox"
                                checked={form.calculation.traffic_light_enabled}
                                onChange={(e) => updateSection(
                                    'calculation',
                                    'traffic_light_enabled',
                                    e.target.checked,
                                )}
                            />
                            Traffic light enabled
                        </label>
                        <label>Red alert consecutive months</label>
                        <input
                            type="number"
                            className="form-input"
                            min={1}
                            value={form.calculation.red_alert_consecutive_months}
                            onChange={(e) => updateSection(
                                'calculation',
                                'red_alert_consecutive_months',
                                Number(e.target.value),
                            )}
                        />
                    </div>
                    <div className="kpi-settings-card">
                        <h4>Cascade</h4>
                        <label>Default cascade rule</label>
                        <select
                            className="form-input"
                            value={form.cascade.default_rule}
                            onChange={(e) => updateSection('cascade', 'default_rule', e.target.value)}
                        >
                            <option value="EQUAL_SPLIT">Equal split</option>
                            <option value="WEIGHTED">Weighted</option>
                            <option value="MANUAL">Manual</option>
                        </select>
                        <label className="kpi-settings-toggle">
                            <input
                                type="checkbox"
                                checked={form.cascade.lock_phasing_on_cycle_start}
                                onChange={(e) => updateSection(
                                    'cascade',
                                    'lock_phasing_on_cycle_start',
                                    e.target.checked,
                                )}
                            />
                            Lock phasing on cycle start
                        </label>
                    </div>
                </div>
            );
        }
        return (
            <div className="kpi-settings-grid">
                <div className="kpi-settings-card">
                    <h4>WebSocket channels</h4>
                    <label className="kpi-settings-toggle">
                        <input
                            type="checkbox"
                            checked={form.realtime.websocket_enabled}
                            onChange={(e) => updateSection(
                                'realtime',
                                'websocket_enabled',
                                e.target.checked,
                            )}
                        />
                        WebSocket enabled
                    </label>
                    <label className="kpi-settings-toggle">
                        <input
                            type="checkbox"
                            checked={form.realtime.push_score_updates}
                            onChange={(e) => updateSection(
                                'realtime',
                                'push_score_updates',
                                e.target.checked,
                            )}
                        />
                        Push score updates
                    </label>
                    <label className="kpi-settings-toggle">
                        <input
                            type="checkbox"
                            checked={form.realtime.push_validation_updates}
                            onChange={(e) => updateSection(
                                'realtime',
                                'push_validation_updates',
                                e.target.checked,
                            )}
                        />
                        Push validation updates
                    </label>
                </div>
                <div className="kpi-settings-card">
                    <h4>Notifications</h4>
                    <label className="kpi-settings-toggle">
                        <input
                            type="checkbox"
                            checked={form.notifications.notify_manager_on_submit}
                            onChange={(e) => updateSection(
                                'notifications',
                                'notify_manager_on_submit',
                                e.target.checked,
                            )}
                        />
                        Notify manager on submit
                    </label>
                    <label className="kpi-settings-toggle">
                        <input
                            type="checkbox"
                            checked={form.notifications.notify_on_red_alert}
                            onChange={(e) => updateSection(
                                'notifications',
                                'notify_on_red_alert',
                                e.target.checked,
                            )}
                        />
                        Notify on red alert
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="kpi-settings-page">
            <div className="kpi-settings-header">
                <h1>KPI Operations</h1>
                <p className="kpi-settings-readonly">
                    Platform-wide KPI policy (singleton). Version <strong>{version}</strong>.
                    Changes apply to validation, calculation, cascade, and real-time push behaviour.
                </p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="kpi-settings-tabs">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className={`kpi-settings-tab ${activeTab === id ? 'kpi-settings-tab--active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        {label}
                    </button>
                ))}
            </div>
            <div className="kpi-settings-panel">
                {renderTab()}
                <div className="kpi-settings-actions">
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        <FiSave /> Save settings
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={isSaving}>
                        <FiRefreshCw /> Reset to defaults
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KpiOperationsConsole;

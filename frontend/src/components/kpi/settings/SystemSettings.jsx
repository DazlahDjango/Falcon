import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { fetchSystemSettings, updateSystemSettings, resetSystemSettings, selectSystemSettings, selectSettingsLoading } from '../../../store/kpi';
import SettingsForm from './SettingsForm';
import SettingsReset from './SettingsReset';
import KPILoading from '../common/KPILoading';
import KPISuccess from '../common/KPISuccess';

const SystemSettings = () => {
    const dispatch = useDispatch();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const settings = useSelector(selectSystemSettings);
    const loading = useSelector(selectSettingsLoading);
    
    useEffect(() => {
        dispatch(fetchSystemSettings());
    }, [dispatch]);
    
    const handleSave = async (data) => {
        await dispatch(updateSystemSettings(data)).unwrap();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        dispatch(fetchSystemSettings());
    };
    
    const handleReset = async () => {
        await dispatch(resetSystemSettings()).unwrap();
        setShowResetConfirm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        dispatch(fetchSystemSettings());
    };
    
    if (loading) {
        return <KPILoading text="Loading system settings..." />;
    }
    
    return (
        <div className="kpi-settings-container">
            <div className="settings-header">
                <h2>System Settings</h2>
                <p>Configure global KPI system behavior and defaults</p>
            </div>
            
            {saved && <KPISuccess message="Settings saved successfully" />}
            
            <div className="settings-content">
                <SettingsForm settings={settings} onSave={handleSave} />
                
                <div className="settings-danger-zone">
                    <div className="danger-zone-header">
                        <FiAlertTriangle size={20} color="var(--kpi-danger)" />
                        <h3>Danger Zone</h3>
                    </div>
                    <p>Reset all KPI system settings to factory defaults. This action cannot be undone.</p>
                    <button className="danger-zone-btn" onClick={() => setShowResetConfirm(true)}>
                        Reset to Defaults
                    </button>
                </div>
            </div>
            
            {showResetConfirm && (
                <SettingsReset onConfirm={handleReset} onCancel={() => setShowResetConfirm(false)} />
            )}
        </div>
    );
};

export default SystemSettings;
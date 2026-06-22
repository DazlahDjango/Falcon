import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiBell, FiMail, FiMessageSquare } from 'react-icons/fi';
import { fetchNotificationPreferences, updateNotificationPreferences, selectNotificationPreferences, selectSettingsLoading } from '../../../store/kpi';
import NotificationTypes from './NotificationTypes';
import KPILoading from '../common/KPILoading';
import KPISuccess from '../common/KPISuccess';

const NotificationPreferences = () => {
    const dispatch = useDispatch();
    const [saved, setSaved] = useState(false);
    const [preferences, setPreferences] = useState({
        push_enabled: true,
        email_enabled: true,
        in_app_enabled: true,
        email_digest_frequency: 'daily',
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        types: {}
    });
    
    const fetchedPrefs = useSelector(selectNotificationPreferences);
    const loading = useSelector(selectSettingsLoading);
    
    useEffect(() => {
        dispatch(fetchNotificationPreferences());
    }, [dispatch]);
    
    useEffect(() => {
        if (fetchedPrefs) {
            setPreferences({
                push_enabled: fetchedPrefs.push_enabled ?? true,
                email_enabled: fetchedPrefs.email_enabled ?? true,
                in_app_enabled: fetchedPrefs.in_app_enabled ?? true,
                email_digest_frequency: fetchedPrefs.email_digest_frequency || 'daily',
                quiet_hours_enabled: fetchedPrefs.quiet_hours_enabled || false,
                quiet_hours_start: fetchedPrefs.quiet_hours_start || '22:00',
                quiet_hours_end: fetchedPrefs.quiet_hours_end || '08:00',
                types: fetchedPrefs.types || {}
            });
        }
    }, [fetchedPrefs]);
    
    const handleChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };
    
    const handleTypeChange = (type, enabled) => {
        setPreferences(prev => ({
            ...prev,
            types: { ...prev.types, [type]: enabled }
        }));
    };
    
    const handleSave = async () => {
        await dispatch(updateNotificationPreferences(preferences)).unwrap();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    
    if (loading) {
        return <KPILoading text="Loading notification preferences..." />;
    }
    
    return (
        <div className="kpi-settings-container">
            <div className="settings-header">
                <h2>Notification Preferences</h2>
                <p>Configure how you receive KPI notifications and alerts</p>
            </div>
            
            {saved && <KPISuccess message="Preferences saved successfully" />}
            
            <div className="settings-content">
                <div className="settings-section">
                    <h3>Channels</h3>
                    <div className="channels-grid">
                        <div className="channel-card">
                            <FiBell size={24} />
                            <div>
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={preferences.push_enabled}
                                        onChange={(e) => handleChange('push_enabled', e.target.checked)}
                                    />
                                    Push Notifications
                                </label>
                                <small>Real-time browser notifications</small>
                            </div>
                        </div>
                        <div className="channel-card">
                            <FiMail size={24} />
                            <div>
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={preferences.email_enabled}
                                        onChange={(e) => handleChange('email_enabled', e.target.checked)}
                                    />
                                    Email Notifications
                                </label>
                                <small>Email summaries and alerts</small>
                            </div>
                        </div>
                        <div className="channel-card">
                            <FiMessageSquare size={24} />
                            <div>
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={preferences.in_app_enabled}
                                        onChange={(e) => handleChange('in_app_enabled', e.target.checked)}
                                    />
                                    In-App Notifications
                                </label>
                                <small>Notifications within the platform</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="settings-section">
                    <h3>Email Digest</h3>
                    <div className="form-group">
                        <label>Digest Frequency</label>
                        <select 
                            value={preferences.email_digest_frequency}
                            onChange={(e) => handleChange('email_digest_frequency', e.target.value)}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="never">Never</option>
                        </select>
                    </div>
                </div>
                
                <div className="settings-section">
                    <h3>Quiet Hours</h3>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={preferences.quiet_hours_enabled}
                                onChange={(e) => handleChange('quiet_hours_enabled', e.target.checked)}
                            />
                            Enable Quiet Hours
                        </label>
                    </div>
                    
                    {preferences.quiet_hours_enabled && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Time</label>
                                <input 
                                    type="time"
                                    value={preferences.quiet_hours_start}
                                    onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time</label>
                                <input 
                                    type="time"
                                    value={preferences.quiet_hours_end}
                                    onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="settings-section">
                    <h3>Notification Types</h3>
                    <NotificationTypes 
                        types={preferences.types}
                        onChange={handleTypeChange}
                    />
                </div>
                
                <div className="settings-actions">
                    <button className="save-settings-btn" onClick={handleSave}>
                        <FiSave size={14} />
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferences;
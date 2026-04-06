import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBell, FiMail, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { fetchNotificationSettings, updateNotificationSettings } from '../../../store/accounts/slice/preferenceSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice'; 

const NotificationSettings = () => {
    const dispatch = useDispatch();
    const { settings, isLoading } = useSelector((state) => state.preferences);
    const [localSettings, setLocalSettings] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        dispatch(fetchNotificationSettings());
    }, [dispatch]);
    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);
    const handleToggle = (eventType, channel) => {
        setLocalSettings(prev => {
            const current = prev[eventType] || [];
            const newChannels = current.includes(channel)
                ? current.filter(c => c !== channel)
                : [...current, channel];
            return { ...prev, [eventType]: newChannels };
        });
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            await dispatch(updateNotificationSettings(localSettings)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Notification settings saved' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to save notification' }));
        } finally {
            setSaving(false);
        }
    };
    const notificationEvents = [
        {
            id: 'kpi_pending',
            name: 'KPI Validation Required',
            description: 'When your KPI entry needs supervisor validation',
            icon: <FiAlertCircle size={16} />
        },
        {
            id: 'kpi_approved',
            name: 'KPI Approved',
            description: 'When your KPI entry is approved',
            icon: <FiBell size={16} />
        },
        {
            id: 'kpi_rejected',
            name: 'KPI Rejected',
            description: 'When your KPI entry is rejected',
            icon: <FiAlertCircle size={16} />
        },
        {
            id: 'review_due',
            name: 'Review Due',
            description: 'When a performance review is approaching',
            icon: <FiBell size={16} />
        },
        {
            id: 'team_activity',
            name: 'Team Activity',
            description: 'When team members update their KPIs',
            icon: <FiMessageSquare size={16} />
        },
        {
            id: 'system_alert',
            name: 'System Alerts',
            description: 'Important system notifications',
            icon: <FiAlertCircle size={16} />
        }
    ];
    const channels = [
        { id: 'email', name: 'Email', icon: <FiMail size={14} /> },
        { id: 'in_app', name: 'In-App', icon: <FiBell size={14} /> },
        { id: 'push', name: 'Push', icon: <FiMessageSquare size={14} /> }
    ];
    return (
        <div className="notification-settings">
            <div className="settings-header">
                <h2>Notification Preferences</h2>
                <p>Choose how you want to be notified</p>
            </div>
            
            <div className="notifications-table">
                <div className="table-header">
                    <div className="event-col">Event</div>
                    {channels.map(channel => (
                        <div key={channel.id} className="channel-col">
                            {channel.icon}
                            <span>{channel.name}</span>
                        </div>
                    ))}
                </div>
                
                {notificationEvents.map(event => (
                    <div key={event.id} className="table-row">
                        <div className="event-col">
                            <div className="event-info">
                                {event.icon}
                                <div>
                                    <strong>{event.name}</strong>
                                    <span>{event.description}</span>
                                </div>
                            </div>
                        </div>
                        {channels.map(channel => (
                            <div key={channel.id} className="channel-col">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={(localSettings[event.id] || []).includes(channel.id)}
                                        onChange={() => handleToggle(event.id, channel.id)}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="form-actions">
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};
export default NotificationSettings;
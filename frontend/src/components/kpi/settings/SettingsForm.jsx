import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

const SettingsForm = ({ settings, onSave }) => {
    const [formData, setFormData] = useState({
        scoring: {
            default_green_threshold: settings?.effective_settings?.scoring?.default_green_threshold || 90,
            default_yellow_threshold: settings?.effective_settings?.scoring?.default_yellow_threshold || 50,
            decimal_places: settings?.effective_settings?.scoring?.decimal_places || 2,
            enable_trend_analysis: settings?.effective_settings?.scoring?.enable_trend_analysis !== false
        },
        validation: {
            auto_approve_threshold: settings?.effective_settings?.validation?.auto_approve_threshold || 95,
            require_evidence: settings?.effective_settings?.validation?.require_evidence !== false,
            escalation_escalation_days: settings?.effective_settings?.validation?.escalation_days || 7
        },
        notifications: {
            enable_email: settings?.effective_settings?.notifications?.enable_email !== false,
            enable_push: settings?.effective_settings?.notifications?.enable_push !== false,
            daily_digest: settings?.effective_settings?.notifications?.daily_digest !== false
        },
        caching: {
            cache_ttl_seconds: settings?.effective_settings?.caching?.cache_ttl_seconds || 300,
            enable_mv_refresh: settings?.effective_settings?.caching?.enable_mv_refresh !== false
        }
    });
    
    const [loading, setLoading] = useState(false);
    
    const handleChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };
    
    return (
        <div className="settings-form">
            <div className="settings-section">
                <h3>Scoring Configuration</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Green Threshold (%)</label>
                        <input 
                            type="number"
                            min="0"
                            max="100"
                            value={formData.scoring.default_green_threshold}
                            onChange={(e) => handleChange('scoring', 'default_green_threshold', parseInt(e.target.value))}
                        />
                        <small>Scores above this are considered "Green" (On Track)</small>
                    </div>
                    <div className="form-group">
                        <label>Yellow Threshold (%)</label>
                        <input 
                            type="number"
                            min="0"
                            max="100"
                            value={formData.scoring.default_yellow_threshold}
                            onChange={(e) => handleChange('scoring', 'default_yellow_threshold', parseInt(e.target.value))}
                        />
                        <small>Scores below green but above this are "Yellow" (At Risk)</small>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Decimal Places</label>
                        <select 
                            value={formData.scoring.decimal_places}
                            onChange={(e) => handleChange('scoring', 'decimal_places', parseInt(e.target.value))}
                        >
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                        </select>
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={formData.scoring.enable_trend_analysis}
                                onChange={(e) => handleChange('scoring', 'enable_trend_analysis', e.target.checked)}
                            />
                            Enable Trend Analysis
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="settings-section">
                <h3>Validation Rules</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Auto-Approve Threshold (%)</label>
                        <input 
                            type="number"
                            min="0"
                            max="100"
                            value={formData.validation.auto_approve_threshold}
                            onChange={(e) => handleChange('validation', 'auto_approve_threshold', parseInt(e.target.value))}
                        />
                        <small>Scores above this are automatically approved</small>
                    </div>
                    <div className="form-group">
                        <label>Escalation Days</label>
                        <input 
                            type="number"
                            min="1"
                            max="30"
                            value={formData.validation.escalation_days}
                            onChange={(e) => handleChange('validation', 'escalation_days', parseInt(e.target.value))}
                        />
                        <small>Days pending before automatic escalation</small>
                    </div>
                </div>
                
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox"
                            checked={formData.validation.require_evidence}
                            onChange={(e) => handleChange('validation', 'require_evidence', e.target.checked)}
                        />
                        Require Evidence for Submission
                    </label>
                </div>
            </div>
            
            <div className="settings-section">
                <h3>Notification Settings</h3>
                <div className="form-row">
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={formData.notifications.enable_email}
                                onChange={(e) => handleChange('notifications', 'enable_email', e.target.checked)}
                            />
                            Enable Email Notifications
                        </label>
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={formData.notifications.enable_push}
                                onChange={(e) => handleChange('notifications', 'enable_push', e.target.checked)}
                            />
                            Enable Push Notifications
                        </label>
                    </div>
                </div>
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox"
                            checked={formData.notifications.daily_digest}
                            onChange={(e) => handleChange('notifications', 'daily_digest', e.target.checked)}
                        />
                        Send Daily Digest
                    </label>
                </div>
            </div>
            
            <div className="settings-section">
                <h3>Performance & Caching</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Cache TTL (seconds)</label>
                        <input 
                            type="number"
                            min="60"
                            max="3600"
                            value={formData.caching.cache_ttl_seconds}
                            onChange={(e) => handleChange('caching', 'cache_ttl_seconds', parseInt(e.target.value))}
                        />
                        <small>How long to cache dashboard data</small>
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={formData.caching.enable_mv_refresh}
                                onChange={(e) => handleChange('caching', 'enable_mv_refresh', e.target.checked)}
                            />
                            Auto-Refresh Materialized Views
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="settings-actions">
                <button className="save-settings-btn" onClick={handleSubmit} disabled={loading}>
                    <FiSave size={14} />
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default SettingsForm;
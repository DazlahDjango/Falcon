// src/pages/reviews/SettingsPage.jsx
import React, { useState } from 'react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        default_rating_scale_id: '',
        default_review_cycle_days: 90,
        auto_activate_cycles: false,
        reminder_days_before_deadline: 7,
    });

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert('Settings saved successfully');
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Review Settings</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Configure review process preferences</p>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Default Review Cycle Duration (days)</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        value={settings.default_review_cycle_days} 
                        onChange={(e) => handleChange('default_review_cycle_days', parseInt(e.target.value))}
                        min="30"
                        max="365"
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Reminder Days Before Deadline</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        value={settings.reminder_days_before_deadline} 
                        onChange={(e) => handleChange('reminder_days_before_deadline', parseInt(e.target.value))}
                        min="1"
                        max="30"
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                            type="checkbox" 
                            checked={settings.auto_activate_cycles} 
                            onChange={(e) => handleChange('auto_activate_cycles', e.target.checked)}
                        />
                        Auto-activate cycles on start date
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button className="btn-primary" onClick={handleSave}>Save Settings</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
import React from 'react';

const NotificationTypes = ({ types, onChange }) => {
    const notificationCategories = [
        {
            category: 'Performance Updates',
            types: [
                { id: 'score_update', label: 'Score Updates', default: true },
                { id: 'target_achieved', label: 'Target Achieved', default: true },
                { id: 'trend_alert', label: 'Trend Alerts', default: false }
            ]
        },
        {
            category: 'Validations',
            types: [
                { id: 'pending_validation', label: 'Pending Validations', default: true },
                { id: 'validation_approved', label: 'Validation Approved', default: true },
                { id: 'validation_rejected', label: 'Validation Rejected', default: true },
                { id: 'validation_overdue', label: 'Validation Overdue', default: true }
            ]
        },
        {
            category: 'Alerts',
            types: [
                { id: 'red_alert', label: 'Red Alerts', default: true },
                { id: 'yellow_alert', label: 'Yellow Alerts', default: false },
                { id: 'consecutive_red', label: 'Consecutive Red Alerts', default: true }
            ]
        },
        {
            category: 'System',
            types: [
                { id: 'report_ready', label: 'Report Ready', default: true },
                { id: 'calculation_complete', label: 'Calculation Complete', default: false },
                { id: 'system_maintenance', label: 'System Maintenance', default: true }
            ]
        }
    ];
    
    return (
        <div className="notification-types">
            {notificationCategories.map(category => (
                <div key={category.category} className="notification-category">
                    <h4>{category.category}</h4>
                    <div className="notification-types-grid">
                        {category.types.map(type => (
                            <label key={type.id} className="checkbox-label">
                                <input 
                                    type="checkbox"
                                    checked={types[type.id] !== undefined ? types[type.id] : type.default}
                                    onChange={(e) => onChange(type.id, e.target.checked)}
                                />
                                {type.label}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationTypes;
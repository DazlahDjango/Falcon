import React from 'react';

const KPIEmptyState = ({ 
    icon = '📊', 
    title = 'No data available', 
    description = 'There is no data to display at the moment.',
    actionText = null,
    onAction = null
}) => {
    return (
        <div className="kpi-empty-container">
            <div className="kpi-empty-icon">{icon}</div>
            <h3 className="kpi-empty-title">{title}</h3>
            <p className="kpi-empty-description">{description}</p>
            {actionText && onAction && (
                <div className="kpi-empty-action">
                    <button className="kpi-btn kpi-btn-primary" onClick={onAction}>
                        {actionText}
                    </button>
                </div>
            )}
        </div>
    );
};

export default KPIEmptyState;
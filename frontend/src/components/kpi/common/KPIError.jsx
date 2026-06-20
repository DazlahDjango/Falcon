import React from 'react';

const KPIError = ({ 
    title = 'Something went wrong', 
    message = 'An error occurred while loading the data.', 
    onRetry = null 
}) => {
    return (
        <div className="kpi-error-container">
            <div className="kpi-error-icon">⚠️</div>
            <h3 className="kpi-error-title">{title}</h3>
            <p className="kpi-error-message">{message}</p>
            {onRetry && (
                <button className="kpi-error-retry-btn" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default KPIError;
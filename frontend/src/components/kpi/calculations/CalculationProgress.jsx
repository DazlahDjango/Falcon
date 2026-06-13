import React from 'react';

const CalculationProgress = ({ progress, status }) => {
    return (
        <div className="calculation-progress">
            <div className="progress-bar-container">
                <div 
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="progress-status">
                <span>{status || 'Processing...'}</span>
                <span>{progress}%</span>
            </div>
        </div>
    );
};

export default CalculationProgress;
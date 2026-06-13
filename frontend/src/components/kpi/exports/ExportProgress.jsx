import React from 'react';

const ExportProgress = ({ progress }) => {
    return (
        <div className="export-progress-section">
            <div className="progress-container">
                <div className="progress-icon">
                    {progress < 100 ? '⏳' : '✅'}
                </div>
                <h4>{progress < 100 ? 'Preparing Export...' : 'Export Complete!'}</h4>
                <p>{progress < 100 ? 'Please wait while we prepare your file' : 'Your download should start shortly'}</p>
                
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-percentage">{progress}%</div>
            </div>
        </div>
    );
};

export default ExportProgress;
import React from 'react';

const KPISuccess = ({ title = 'Success!', message = 'Operation completed successfully.' }) => {
    return (
        <div className="kpi-success-container">
            <div className="kpi-success-icon">✓</div>
            <h3 className="kpi-success-title">{title}</h3>
            <p className="kpi-success-message">{message}</p>
        </div>
    );
};

export default KPISuccess;
import React from 'react';

const KPILoading = ({ size = 'md', text = 'Loading...', type = 'spinner' }) => {
    const sizes = {
        sm: 'kpi-loading-spinner-sm',
        md: '',
        lg: 'kpi-loading-spinner-lg'
    };

    if (type === 'skeleton') {
        return (
            <div className="kpi-loading-container">
                <div className="kpi-loading-skeleton" style={{ width: '100%', height: 200 }} />
                <div className="kpi-loading-skeleton" style={{ width: '80%', height: 40 }} />
                <div className="kpi-loading-skeleton" style={{ width: '60%', height: 20 }} />
            </div>
        );
    }

    return (
        <div className="kpi-loading-container">
            <div className={`kpi-loading-spinner ${sizes[size]}`} />
            {text && <div className="kpi-loading-text">{text}</div>}
        </div>
    );
};

export default KPILoading;
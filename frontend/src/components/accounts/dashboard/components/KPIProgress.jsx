import React from 'react';
import { FiInfo } from 'react-icons/fi';

const KPIProgress = ({ kpis = [], title = 'My KPIs' }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'on_track': return '#10b981';
            case 'at_risk': return '#f59e0b';
            case 'off_track': return '#ef4444';
            default: return '#6b7280';
        }
    };
    
    const getStatusText = (status) => {
        switch (status) {
            case 'on_track': return 'On Track';
            case 'at_risk': return 'At Risk';
            case 'off_track': return 'Off Track';
            default: return 'Not Started';
        }
    };
    
    if (kpis.length === 0) {
        return (
            <div className="kpi-progress empty">
                <h3>{title}</h3>
                <p>No KPIs assigned yet</p>
            </div>
        );
    }
    
    return (
        <div className="kpi-progress">
            <div className="kpi-header">
                <h3>{title}</h3>
                <button className="info-btn" title="KPI Overview">
                    <FiInfo size={16} />
                </button>
            </div>
            <div className="kpi-list">
                {kpis.map((kpi) => (
                    <div key={kpi.id} className="kpi-item">
                        <div className="kpi-info">
                            <span className="kpi-name">{kpi.name}</span>
                            <span className="kpi-weight">{kpi.weight}%</span>
                        </div>
                        <div className="kpi-progress-bar">
                            <div 
                                className="kpi-progress-fill"
                                style={{ 
                                    width: `${kpi.progress}%`,
                                    backgroundColor: getStatusColor(kpi.status)
                                }}
                            />
                        </div>
                        <div className="kpi-stats">
                            <span className="kpi-target">Target: {kpi.target}</span>
                            <span className="kpi-actual">Actual: {kpi.actual}</span>
                            <span className={`kpi-status status-${kpi.status}`}>
                                {getStatusText(kpi.status)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KPIProgress;
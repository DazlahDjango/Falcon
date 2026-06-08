import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const AreasForImprovement = ({ insights }) => {
    const areas = insights?.areas_for_improvement || [];
    
    if (areas.length === 0) {
        return (
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <h3>Areas for Improvement</h3>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--kpi-space-6)', color: 'var(--kpi-gray-500)' }}>
                    No areas identified for improvement
                </div>
            </div>
        );
    }
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Areas for Improvement</h3>
                <span className="count">{areas.length}</span>
            </div>
            
            <div className="ranking-list">
                {areas.map((area, index) => (
                    <div key={area.name} className="ranking-item">
                        <div className="ranking-position" style={{ color: 'var(--kpi-danger)' }}>
                            <FiAlertTriangle size={14} />
                        </div>
                        <div className="ranking-name">{area.name}</div>
                        <div className="ranking-score" style={{ color: 'var(--kpi-danger)' }}>
                            {area.score}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AreasForImprovement;
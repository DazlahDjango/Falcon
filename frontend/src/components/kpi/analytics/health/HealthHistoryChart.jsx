import React from 'react';

const HealthHistoryChart = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <h3>Health History</h3>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--kpi-space-8)', color: 'var(--kpi-gray-500)' }}>
                    No history data available
                </div>
            </div>
        );
    }
    
    const maxScore = Math.max(...history.map(h => h.overall_health_score), 100);
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Health History (Last {history.length} Months)</h3>
            </div>
            
            <div className="history-chart">
                <div className="chart-bars">
                    {history.map((item, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div 
                                className="chart-bar"
                                style={{ 
                                    height: `${(item.overall_health_score / maxScore) * 100}%`,
                                    background: item.overall_health_score >= 90 ? 'var(--kpi-success)' :
                                               item.overall_health_score >= 75 ? 'var(--kpi-primary)' :
                                               item.overall_health_score >= 50 ? 'var(--kpi-warning)' : 'var(--kpi-danger)'
                                }}
                            >
                                <span className="chart-value">{item.overall_health_score.toFixed(0)}%</span>
                            </div>
                            <div className="chart-label">{item.period}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthHistoryChart;
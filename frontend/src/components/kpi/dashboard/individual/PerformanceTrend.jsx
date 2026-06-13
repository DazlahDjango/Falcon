import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const PerformanceTrend = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Performance Trend</h3>
                </div>
                <div className="card-empty">No trend data available</div>
            </div>
        );
    }
    
    const maxValue = Math.max(...data.map(d => d.score), 100);
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Performance Trend</h3>
                <FiTrendingUp size={16} color="var(--kpi-success)" />
            </div>
            <div className="trend-chart">
                <div className="chart-bars">
                    {data.map((item, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div 
                                className="chart-bar"
                                style={{ height: `${(item.score / maxValue) * 100}%` }}
                            >
                                <span className="chart-value">{item.score}%</span>
                            </div>
                            <div className="chart-label">{item.month}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceTrend;
import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const TrendAnalysis = ({ trendData }) => {
    if (!trendData || trendData.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Performance Trend</h3>
                </div>
                <div className="card-empty">No trend data available</div>
            </div>
        );
    }
    
    const maxValue = Math.max(...trendData.map(d => d.score), 100);
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Performance Trend</h3>
                <FiTrendingUp size={16} color="var(--kpi-success)" />
            </div>
            <div className="trend-chart">
                <div className="chart-bars">
                    {trendData.map((item, index) => (
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
            <div className="trend-summary">
                <div className="trend-stat">
                    <span className="label">Avg Score</span>
                    <span className="value">{trendData.reduce((sum, d) => sum + d.score, 0) / trendData.length}%</span>
                </div>
                <div className="trend-stat">
                    <span className="label">Peak</span>
                    <span className="value">{Math.max(...trendData.map(d => d.score))}%</span>
                </div>
                <div className="trend-stat">
                    <span className="label">Lowest</span>
                    <span className="value">{Math.min(...trendData.map(d => d.score))}%</span>
                </div>
            </div>
        </div>
    );
};

export default TrendAnalysis;
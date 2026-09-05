import React from 'react';
import { FiTarget } from 'react-icons/fi';
import TrafficLightIcon from '../../scores/TrafficLightIcon';

const MyKPIScores = ({ scores }) => {
    if (!scores || scores.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>My Performance Indicator Scores</h3>
                </div>
                <div className="card-empty">No Performance Indicator data available</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>My Performance Indicator Scores</h3>
                <span className="card-count">{scores.length} Performance Indicators</span>
            </div>
            <div className="kpi-scores-list">
                {scores.map((kpi, index) => (
                    <div key={index} className="kpi-score-item">
                        <div className="kpi-score-info">
                            <div className="kpi-score-name">{kpi.kpi_name}</div>
                            <div className="kpi-score-status">
                                <TrafficLightIcon status={kpi.status} size="sm" />
                                <span>{kpi.status_display}</span>
                            </div>
                        </div>
                        <div className="kpi-score-value">
                            <span className="score-number">{kpi.score}%</span>
                            <div className="score-details">
                                <span>{kpi.actual_value} / {kpi.target_value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyKPIScores;
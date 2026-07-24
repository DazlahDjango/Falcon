// frontend/src/components/reports/analytics/AnomalyDetection.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ReportLoading } from '../common';
import { AnalyticsChart } from './AnalyticsChart';
import './analytics.css';

export const AnomalyDetection = ({ data, loading = false }) => {
    if (loading) {
        return <ReportLoading variant="spinner" text="Detecting anomalies..." />;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <span className="empty-icon">🚨</span>
                <p>No anomaly data available</p>
                <span className="empty-hint">Run anomaly detection to see results</span>
            </div>
        );
    }

    const {
        anomalies = [],
        summary = {},
        total_data_points = 0,
        anomaly_rate = 0,
    } = data;

    const {
        anomalies_count = 0,
        outliers_count = 0,
        sudden_changes_count = 0,
    } = summary;

    const getSeverityColor = (severity) => {
        const colors = {
            low: '#94a3b8',
            medium: '#f59e0b',
            high: '#f97316',
            critical: '#ef4444',
        };
        return colors[severity] || '#94a3b8';
    };

    const getSeverityLabel = (severity) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            critical: 'Critical',
        };
        return labels[severity] || severity;
    };

    const chartData = {
        labels: anomalies.map((a, idx) => `#${idx + 1}`),
        datasets: [
            {
                label: 'Z-Score',
                data: anomalies.map((a) => a.z_score || 0),
                backgroundColor: anomalies.map((a) =>
                    getSeverityColor(a.severity || 'medium')
                ),
            },
        ],
    };

    return (
        <div className="anomaly-detection">
            <div className="anomaly-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Data Points</span>
                    <span className="stat-value">{total_data_points}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Anomalies Detected</span>
                    <span className="stat-value" style={{ color: '#ef4444' }}>
                        {anomalies_count}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Outliers</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>
                        {outliers_count}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Sudden Changes</span>
                    <span className="stat-value" style={{ color: '#f97316' }}>
                        {sudden_changes_count}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Anomaly Rate</span>
                    <span className="stat-value" style={{ color: anomaly_rate > 0.1 ? '#ef4444' : '#10b981' }}>
                        {(anomaly_rate * 100).toFixed(1)}%
                    </span>
                </div>
            </div>

            {anomalies.length > 0 && (
                <>
                    <div className="analytics-chart-container">
                        <AnalyticsChart
                            data={chartData}
                            type="bar"
                            title="Anomaly Scores"
                            height={250}
                        />
                    </div>

                    <div className="anomalies-list">
                        <h4>Detected Anomalies</h4>
                        <div className="anomalies-grid">
                            {anomalies.slice(0, 20).map((anomaly, idx) => (
                                <div key={idx} className="anomaly-item">
                                    <div className="anomaly-header">
                                        <span className="anomaly-index">#{idx + 1}</span>
                                        <span
                                            className="anomaly-severity"
                                            style={{
                                                backgroundColor: getSeverityColor(anomaly.severity || 'medium'),
                                            }}
                                        >
                                            {getSeverityLabel(anomaly.severity || 'medium')}
                                        </span>
                                    </div>
                                    <div className="anomaly-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Value:</span>
                                            <span className="detail-value">{anomaly.value?.toFixed(2) || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Z-Score:</span>
                                            <span className="detail-value">{anomaly.z_score?.toFixed(2) || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Mean:</span>
                                            <span className="detail-value">{anomaly.mean?.toFixed(2) || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Std Dev:</span>
                                            <span className="detail-value">{anomaly.std_dev?.toFixed(2) || '-'}</span>
                                        </div>
                                        {anomaly.direction && (
                                            <div className="detail-row">
                                                <span className="detail-label">Direction:</span>
                                                <span className="detail-value">{anomaly.direction}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {anomalies.length > 20 && (
                            <div className="anomalies-more">
                                Showing 20 of {anomalies.length} anomalies
                            </div>
                        )}
                    </div>
                </>
            )}

            {anomalies.length === 0 && (
                <div className="no-anomalies">
                    <span className="success-icon">✅</span>
                    <p>No anomalies detected</p>
                    <span className="success-hint">All data points appear to be within normal range</span>
                </div>
            )}
        </div>
    );
};

AnomalyDetection.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool,
};
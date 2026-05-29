import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LineChart, ScoreGauge } from '../common';
import analyticsService from '../../../services/kpi/analytics.service';
import styles from './OrganizationHealthReport.module.css';

const OrganizationHealthReport = ({ tenantId, year, month, refreshTrigger }) => {
    const [health, setHealth] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealthData();
    }, [year, month, refreshTrigger]);

    const fetchHealthData = async () => {
        setLoading(true);
        try {
            const [currentHealth, healthHistory] = await Promise.all([
                analyticsService.getOrganizationHealthCurrent(year, month),
                analyticsService.getOrganizationHealthHistory?.() || Promise.resolve([])
            ]);
            setHealth(currentHealth);
            setHistory(healthHistory);
        } catch (error) {
            console.error('Failed to fetch organization health:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendData = () => {
        if (!history.length) return { labels: [], datasets: [] };
        
        const sorted = [...history].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });

        return {
            labels: sorted.map(h => `${h.year}-${String(h.month).padStart(2, '0')}`),
            datasets: [{
                label: 'Organization Health Score',
                data: sorted.map(h => h.overall_health_score || 0),
                color: '#3b82f6',
                area: true,
            }]
        };
    };

    const getRiskLevel = () => {
        const score = health?.overall_health_score || 0;
        if (score >= 85) return { level: 'Low', color: '#22c55e', text: 'Stable - Continue current strategy' };
        if (score >= 60) return { level: 'Medium', color: '#eab308', text: 'Monitor - Some areas need attention' };
        return { level: 'High', color: '#ef4444', text: 'Critical - Immediate action required' };
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading organization health...</p>
            </div>
        );
    }

    if (!health) {
        return (
            <div className={styles.emptyState}>
                <p>No organization health data available.</p>
            </div>
        );
    }

    const risk = getRiskLevel();

    return (
        <div className={styles.healthReport}>
            <div className={styles.healthGrid}>
                <div className={styles.gaugeCard}>
                    <ScoreGauge
                        score={health.overall_health_score || 0}
                        title="Organization Health"
                        size="lg"
                        showDetails={true}
                    />
                </div>

                <div className={styles.metricsCard}>
                    <div className={styles.metricsGrid}>
                        <div className={styles.metric}>
                            <div className={styles.metricValue}>{health.kpi_completion_rate?.toFixed(1)}%</div>
                            <div className={styles.metricLabel}>KPI Completion</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.metricValue}>{health.validation_compliance_rate?.toFixed(1)}%</div>
                            <div className={styles.metricLabel}>Validation Compliance</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.metricValue}>{health.red_kpi_count || 0}</div>
                            <div className={styles.metricLabel}>Red KPIs</div>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.metricValue}>{health.active_employees || 0}</div>
                            <div className={styles.metricLabel}>Active Employees</div>
                        </div>
                    </div>
                </div>

                <div className={styles.riskCard} style={{ borderLeftColor: risk.color }}>
                    <div className={styles.riskLevel}>Risk Level: <span style={{ color: risk.color }}>{risk.level}</span></div>
                    <div className={styles.riskText}>{risk.text}</div>
                </div>
            </div>

            {history.length > 0 && (
                <div className={styles.trendCard}>
                    <h4>Health Trend (Last 12 Months)</h4>
                    <LineChart data={getTrendData()} height={300} />
                </div>
            )}

            <div className={styles.recommendations}>
                <h4>Recommendations</h4>
                <ul>
                    {health.overall_health_score < 70 && (
                        <li>⚠️ Organization health is below target. Focus on improving red KPIs.</li>
                    )}
                    {health.validation_compliance_rate < 80 && (
                        <li>📋 Validation compliance is low. Remind managers to review pending entries.</li>
                    )}
                    {health.red_kpi_count > 5 && (
                        <li>🔴 Multiple red KPIs detected. Schedule performance reviews for affected teams.</li>
                    )}
                    {health.overall_health_score >= 85 && (
                        <li>✅ Excellent performance! Continue current strategy and celebrate wins.</li>
                    )}
                    {health.overall_health_score >= 70 && health.overall_health_score < 85 && (
                        <li>📈 Good performance with room for improvement. Focus on yellow KPIs.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

OrganizationHealthReport.propTypes = {
    tenantId: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    refreshTrigger: PropTypes.number,
};

export default OrganizationHealthReport;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LineChart, TrafficLight } from '../../../common';
import scoreService from '../../../../../services/kpi/score.service';
import styles from './KPIDetail.module.css';

const KPIDetailScores = ({ kpiId }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    useEffect(() => {
        fetchScores();
    }, [kpiId, selectedYear]);
    const fetchScores = async () => {
        setLoading(true);
        try {
            const response = await scoreService.getScores({ kpi: kpiId, year: selectedYear });
            setScores(response.results || []);
        } catch (error) {
            console.error('Failed to fetch scores:', error);
        } finally {
            setLoading(false);
        }
    };
    const chartData = {
        labels: scores.map(s => `Month ${s.month}`),
        datasets: [
            {
                label: 'Score (%)',
                data: scores.map(s => s.score),
                color: '#3b82f6',
                area: true,
            }
        ],
        yAxisLabel: 'Score (%)'
    };
    const getScoreColor = (score) => {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 70) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    };
    const years = [2023, 2024, 2025, 2026];
    if (loading) {
        return <div className={styles.loadingSmall}>Loading scores...</div>;
    }
    if (scores.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No score data available for this KPI</p>
            </div>
        );
    }
    return (
        <div className={styles.scoresSection}>
            <div className={styles.sectionHeader}>
                <h3>Performance Scores</h3>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className={styles.yearSelect}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            
            <div className={styles.chartContainer}>
                <LineChart data={chartData} height={300} />
            </div>

            <div className={styles.scoresTable}>
                <div className={styles.tableHeader}>
                    <div>Month</div>
                    <div>Score</div>
                    <div>Status</div>
                    <div>Actual</div>
                    <div>Target</div>
                </div>
                {scores.map(score => (
                    <div key={score.month} className={styles.tableRow}>
                        <div>{new Date(selectedYear, score.month - 1).toLocaleString('default', { month: 'short' })}</div>
                        <div className={`${styles.scoreValue} ${getScoreColor(score.score)}`}>
                            {score.score.toFixed(1)}%
                        </div>
                        <div>
                            <TrafficLight status={score.traffic_light?.status || 'YELLOW'} size="sm" showLabel={false} />
                        </div>
                        <div>{score.actual_value} {score.unit}</div>
                        <div>{score.target_value} {score.unit}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
KPIDetailScores.propTypes = {
    kpiId: PropTypes.string,
};
export default KPIDetailScores;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ScoreTrendChart from './ScoreTrendChart';
import { LineChart } from '../../../common';
import scoreService from '../../../../../services/kpi/score.service';
import styles from './ScoreReports.module.css';

const ScoreReports = ({ year, month, onError }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedKpi, setSelectedKpi] = useState('');
    const [users, setUsers] = useState([]);
    const [kpis, setKpis] = useState([]);
    useEffect(() => {
        fetchScores();
        fetchFilters();
    }, [year, month, selectedUser, selectedKpi]);
    const fetchScores = async () => {
        setLoading(true);
        try {
            const params = { year, month };
            if (selectedUser) params.user = selectedUser;
            if (selectedKpi) params.kpi = selectedKpi;
            const response = await scoreService.getScores(params);
            setScores(response.results || []);
        } catch (error) {
            console.error('Failed to fetch scores:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchFilters = async () => {
        try {
            const userResponse = await fetch('/users');
            const userData = await userResponse.json();
            setUsers(userData.results || []);
            const kpiResponse = await fetch('/kpi/kpis/?page_size=100');
            const kpiData = await kpiResponse.json();
            setKpis(kpiData.results || []);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };
    const getScoreDistributionData = () => {
        const distribution = {
            '90-100': 0,
            '75-89': 0,
            '50-74': 0,
            '0-49': 0
        };
        scores.forEach(score => {
            if (score.score >= 90) distribution['90-100']++;
            else if (score.score >= 75) distribution['75-89']++;
            else if (score.score >= 50) distribution['50-74']++;
            else distribution['0-49']++;
        });
        return {
            labels: ['90-100%', '75-89%', '50-74%', '0-49%'],
            values: [
                distribution['90-100'],
                distribution['75-89'],
                distribution['50-74'],
                distribution['0-49']
            ],
            colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444']
        };
    };
    const getTrendData = () => {
        const userScores = {};
        scores.forEach(score => {
            if (!userScores[score.user_id]) {
                userScores[score.user_id] = {
                    name: score.user_name || score.user_email,
                    scores: []
                };
            }
            userScores[score.user_id].scores.push({
                month: score.month,
                score: score.score
            });
        });
        return userScores;
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading score reports...</p>
            </div>
        );
    }
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / (scores.length || 1);
    return (
        <div className={styles.scoreReports}>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>User</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">All Users</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name || user.email}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>KPI</label>
                    <select value={selectedKpi} onChange={(e) => setSelectedKpi(e.target.value)}>
                        <option value="">All KPIs</option>
                        {kpis.map(kpi => (
                            <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{scores.length}</div>
                    <div className={styles.statLabel}>Total Scores</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{avgScore.toFixed(1)}%</div>
                    <div className={styles.statLabel}>Average Score</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {scores.filter(s => s.score >= 90).length}
                    </div>
                    <div className={styles.statLabel}>Top Performers</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {scores.filter(s => s.score < 50).length}
                    </div>
                    <div className={styles.statLabel}>Needs Attention</div>
                </div>
            </div>

            <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                    <h4>Score Distribution</h4>
                    <ScoreTrendChart data={getScoreDistributionData()} type="pie" />
                </div>
                <div className={styles.chartCard}>
                    <h4>Performance by User</h4>
                    <ScoreTrendChart data={getTrendData()} type="bar" />
                </div>
            </div>

            <div className={styles.scoresTable}>
                <div className={styles.tableHeader}>
                    <div>User</div>
                    <div>KPI</div>
                    <div>Score</div>
                    <div>Status</div>
                </div>
                {scores.slice(0, 20).map(score => (
                    <div key={score.id} className={styles.tableRow}>
                        <div>{score.user_name || score.user_email}</div>
                        <div>{score.kpi_name}</div>
                        <div className={getScoreClass(score.score)}>
                            {score.score.toFixed(1)}%
                        </div>
                        <div>
                            <span className={`${styles.statusBadge} ${getStatusClass(score.traffic_light?.status)}`}>
                                {score.traffic_light?.status || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    function getScoreClass(score) {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 75) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    }
    function getStatusClass(status) {
        if (status === 'GREEN') return styles.statusGreen;
        if (status === 'YELLOW') return styles.statusYellow;
        if (status === 'RED') return styles.statusRed;
        return '';
    }
};
ScoreReports.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    onError: PropTypes.func,
};
export default ScoreReports;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart, PieChart } from '../common/KPIChart';
import analyticsService from '../../../services/kpi/analytics.service';
import styles from './KPISummaryReport.module.css';

const KPISummaryReport = ({ tenantId, year, month, refreshTrigger }) => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('average_score');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchSummaries();
    }, [year, month, refreshTrigger]);

    const fetchSummaries = async () => {
        setLoading(true);
        try {
            const data = await analyticsService.getKPISummaries({ year, month });
            setSummaries(data.results || []);
        } catch (error) {
            console.error('Failed to fetch KPI summaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        const topKPIs = [...summaries]
            .sort((a, b) => b.average_score - a.average_score)
            .slice(0, 10);

        return {
            labels: topKPIs.map(k => k.kpi__name.length > 20 ? k.kpi__name.substring(0, 20) + '...' : k.kpi__name),
            datasets: [{
                label: 'Average Score (%)',
                data: topKPIs.map(k => k.average_score),
                color: '#3b82f6',
            }]
        };
    };

    const getStatusDistribution = () => {
        let green = 0, yellow = 0, red = 0;
        summaries.forEach(k => {
            if (k.average_score >= 90) green++;
            else if (k.average_score >= 50) yellow++;
            else red++;
        });

        return {
            labels: ['On Track (≥90%)', 'At Risk (50-89%)', 'Off Track (<50%)'],
            values: [green, yellow, red],
            colors: ['#22c55e', '#eab308', '#ef4444']
        };
    };

    const filteredAndSortedSummaries = () => {
        let filtered = [...summaries];

        if (searchTerm) {
            filtered = filtered.filter(k =>
                k.kpi__name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                k.kpi__code?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(k => {
                if (statusFilter === 'green') return k.average_score >= 90;
                if (statusFilter === 'yellow') return k.average_score >= 50 && k.average_score < 90;
                if (statusFilter === 'red') return k.average_score < 50;
                return true;
            });
        }

        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (sortBy === 'average_score') {
                return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
            }
            return sortOrder === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
        });

        return filtered;
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortOrder === 'desc' ? '↓' : '↑';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading KPI summaries...</p>
            </div>
        );
    }

    const filteredData = filteredAndSortedSummaries();
    const avgScore = summaries.length > 0
        ? (summaries.reduce((sum, k) => sum + k.average_score, 0) / summaries.length).toFixed(1)
        : 0;

    return (
        <div className={styles.kpiSummary}>
            <div className={styles.statsCards}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{summaries.length}</div>
                    <div className={styles.statLabel}>Total KPIs</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{avgScore}%</div>
                    <div className={styles.statLabel}>Average Score</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {summaries.filter(k => k.average_score >= 90).length}
                    </div>
                    <div className={styles.statLabel}>On Track</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {summaries.filter(k => k.average_score < 50).length}
                    </div>
                    <div className={styles.statLabel}>Off Track</div>
                </div>
            </div>

            <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                    <h4>Top 10 KPIs</h4>
                    <BarChart data={getChartData()} height={300} />
                </div>
                <div className={styles.chartCard}>
                    <h4>Status Distribution</h4>
                    <PieChart data={getStatusDistribution()} height={300} />
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search KPIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.statusFilters}>
                    <button
                        className={`${styles.statusBtn} ${statusFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All ({summaries.length})
                    </button>
                    <button
                        className={`${styles.statusBtn} ${styles.green} ${statusFilter === 'green' ? styles.active : ''}`}
                        onClick={() => setStatusFilter('green')}
                    >
                        🟢 On Track ({summaries.filter(k => k.average_score >= 90).length})
                    </button>
                    <button
                        className={`${styles.statusBtn} ${styles.yellow} ${statusFilter === 'yellow' ? styles.active : ''}`}
                        onClick={() => setStatusFilter('yellow')}
                    >
                        🟡 At Risk ({summaries.filter(k => k.average_score >= 50 && k.average_score < 90).length})
                    </button>
                    <button
                        className={`${styles.statusBtn} ${styles.red} ${statusFilter === 'red' ? styles.active : ''}`}
                        onClick={() => setStatusFilter('red')}
                    >
                        🔴 Off Track ({summaries.filter(k => k.average_score < 50).length})
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerCell} onClick={() => handleSort('kpi__name')}>
                        KPI Name {getSortIcon('kpi__name')}
                    </div>
                    <div className={styles.headerCell} onClick={() => handleSort('average_score')}>
                        Avg Score {getSortIcon('average_score')}
                    </div>
                    <div className={styles.headerCell}>Distribution</div>
                    <div className={styles.headerCell}>Users</div>
                </div>

                {filteredData.length === 0 ? (
                    <div className={styles.emptyState}>No KPIs match your filters</div>
                ) : (
                    filteredData.map(kpi => (
                        <div key={kpi.kpi__id} className={styles.tableRow}>
                            <div className={styles.cell}>
                                <div className={styles.kpiName}>{kpi.kpi__name}</div>
                                <div className={styles.kpiCode}>{kpi.kpi__code}</div>
                            </div>
                            <div className={styles.cell}>
                                <span className={`${styles.scoreValue} ${getScoreClass(kpi.average_score)}`}>
                                    {kpi.average_score?.toFixed(1)}%
                                </span>
                            </div>
                            <div className={styles.cell}>
                                <div className={styles.distributionBars}>
                                    <div className={styles.greenBar} style={{ width: `${(kpi.green_count / (kpi.green_count + kpi.yellow_count + kpi.red_count) * 100) || 0}%` }} />
                                    <div className={styles.yellowBar} style={{ width: `${(kpi.yellow_count / (kpi.green_count + kpi.yellow_count + kpi.red_count) * 100) || 0}%` }} />
                                    <div className={styles.redBar} style={{ width: `${(kpi.red_count / (kpi.green_count + kpi.yellow_count + kpi.red_count) * 100) || 0}%` }} />
                                </div>
                                <div className={styles.distributionLabels}>
                                    <span>🟢 {kpi.green_count}</span>
                                    <span>🟡 {kpi.yellow_count}</span>
                                    <span>🔴 {kpi.red_count}</span>
                                </div>
                            </div>
                            <div className={styles.cell}>{kpi.total_users}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    function getScoreClass(score) {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 70) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    }
};

KPISummaryReport.propTypes = {
    tenantId: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    refreshTrigger: PropTypes.number,
};

export default KPISummaryReport;
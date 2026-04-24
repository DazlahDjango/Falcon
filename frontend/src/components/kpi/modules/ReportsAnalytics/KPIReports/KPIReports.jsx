import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KPIReportFilters from './KPIReportFilters';
import { BarChart, PieChart, KPICard } from '../../../common';
import { analyticsService } from '../../../../../services/kpi/analytics.service';
import styles from './KPIReports.module.css';

const KPIReports = ({ year, month, onError }) => {
    const [kpiSummaries, setKpiSummaries] = useState([]);
    const [filteredSummaries, setFilteredSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        sector: '',
        category: '',
        healthStatus: ''
    });
    useEffect(() => {
        fetchKPISummaries();
    }, [year, month]);
    useEffect(() => {
        applyFilters();
    }, [kpiSummaries, filters]);
    const fetchKPISummaries = async () => {
        setLoading(true);
        try {
            const response = await analyticsService.getKPISummaries({ year, month });
            setKpiSummaries(response.results || []);
            setFilteredSummaries(response.results || []);
        } catch (error) {
            console.error('Failed to fetch KPI summaries:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        let filtered = [...kpiSummaries];
        if (filters.search) {
            filtered = filtered.filter(k => 
                k.kpi_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                k.kpi_code?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        if (filters.healthStatus) {
            filtered = filtered.filter(k => k.health_status === filters.healthStatus);
        }
        setFilteredSummaries(filtered);
    };
    const getChartData = () => {
        const statusCounts = {
            EXCELLENT: 0,
            GOOD: 0,
            FAIR: 0,
            POOR: 0
        };
        filteredSummaries.forEach(k => {
            statusCounts[k.healthStatus] = (statusCounts[k.healthStatus] || 0) + 1;
        });
        return {
            labels: ['Excellent', 'Good', 'Fair', 'Poor'],
            values: [
                statusCounts.EXCELLENT,
                statusCounts.GOOD,
                statusCounts.FAIR,
                statusCounts.POOR
            ],
            colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444']
        };
    };
    const getAverageScoreData = () => {
        const sorted = [...filteredSummaries].sort((a, b) => b.average_score - a.average_score);
        const top10 = sorted.slice(0, 10);
        
        return {
            labels: top10.map(k => k.kpi_name.length > 20 ? k.kpi_name.substring(0, 20) + '...' : k.kpi_name),
            datasets: [
                {
                    label: 'Average Score (%)',
                    data: top10.map(k => k.average_score),
                    color: '#3b82f6',
                }
            ]
        };
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading KPI reports...</p>
            </div>
        );
    }
    return (
        <div className={styles.kpiReports}>
            <KPIReportFilters 
                filters={filters}
                onFilterChange={setFilters}
                totalCount={filteredSummaries.length}
            />

            <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                    <h4>KPI Health Distribution</h4>
                    <PieChart 
                        data={getChartData()} 
                        height={250}
                    />
                </div>
                <div className={styles.chartCard}>
                    <h4>Top Performing KPIs</h4>
                    <BarChart 
                        data={getAverageScoreData()} 
                        height={250}
                    />
                </div>
            </div>

            <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{filteredSummaries.length}</div>
                    <div className={styles.statLabel}>Total KPIs</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {(filteredSummaries.reduce((sum, k) => sum + k.average_score, 0) / filteredSummaries.length || 0).toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>Average Score</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {filteredSummaries.filter(k => k.health_status === 'EXCELLENT').length}
                    </div>
                    <div className={styles.statLabel}>Excellent</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {filteredSummaries.filter(k => k.health_status === 'POOR').length}
                    </div>
                    <div className={styles.statLabel}>Poor</div>
                </div>
            </div>

            <div className={styles.kpiTable}>
                <div className={styles.tableHeader}>
                    <div>KPI Name</div>
                    <div>Avg Score</div>
                    <div>Status Distribution</div>
                    <div>Health</div>
                </div>
                {filteredSummaries.slice(0, 20).map(kpi => (
                    <div key={kpi.kpi_id} className={styles.tableRow}>
                        <div className={styles.kpiInfo}>
                            <div className={styles.kpiName}>{kpi.kpi_name}</div>
                            <div className={styles.kpiCode}>{kpi.kpi_code}</div>
                        </div>
                        <div className={`${styles.scoreValue} ${getScoreClass(kpi.average_score)}`}>
                            {kpi.average_score?.toFixed(1)}%
                        </div>
                        <div className={styles.statusDistribution}>
                            <span className={styles.greenCount}>🟢 {kpi.green_count}</span>
                            <span className={styles.yellowCount}>🟡 {kpi.yellow_count}</span>
                            <span className={styles.redCount}>🔴 {kpi.red_count}</span>
                        </div>
                        <div>
                            <span className={`${styles.healthBadge} ${styles[kpi.health_status?.toLowerCase()]}`}>
                                {kpi.health_status}
                            </span>
                        </div>
                    </div>
                ))}
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
KPIReports.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    onError: PropTypes.func,
};
export default KPIReports;
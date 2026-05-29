import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import analyticsService from '../../../services/kpi/analytics.service';
import styles from './PerformanceHeatmap.module.css';

const PerformanceHeatmap = ({ tenantId, year, month, refreshTrigger }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        fetchHeatmap();
    }, [year, month, refreshTrigger]);

    const fetchHeatmap = async () => {
        setLoading(true);
        try {
            const data = await analyticsService.getHeatmap?.(year, month);
            setHeatmapData(data?.data || []);
        } catch (error) {
            console.error('Failed to fetch heatmap:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#22c55e';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const getScoreIntensity = (score) => {
        if (score >= 90) return 'high';
        if (score >= 70) return 'medium-high';
        if (score >= 50) return 'medium';
        return 'low';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading heatmap data...</p>
            </div>
        );
    }

    if (!heatmapData.length) {
        return (
            <div className={styles.emptyState}>
                <p>No heatmap data available for the selected period.</p>
            </div>
        );
    }

    // Get all unique KPI names across departments
    const allKPIs = [...new Set(heatmapData.flatMap(d => d.kpis.map(k => k.kpi_name)))];

    return (
        <div className={styles.heatmap}>
            <div className={styles.controls}>
                <button className={styles.exportBtn} onClick={() => analyticsService.exportAnalytics?.('csv', year, month)}>
                    📥 Export Data
                </button>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendTitle}>Score Legend:</div>
                <div className={styles.legendItems}>
                    <div className={styles.legendItem}><div className={styles.legendColor} style={{ background: '#22c55e' }} /> Excellent (90-100%)</div>
                    <div className={styles.legendItem}><div className={styles.legendColor} style={{ background: '#3b82f6' }} /> Good (70-89%)</div>
                    <div className={styles.legendItem}><div className={styles.legendColor} style={{ background: '#eab308' }} /> Fair (50-69%)</div>
                    <div className={styles.legendItem}><div className={styles.legendColor} style={{ background: '#ef4444' }} /> Poor (0-49%)</div>
                </div>
            </div>

            <div className={styles.heatmapTable}>
                <div className={styles.heatmapHeader}>
                    <div className={styles.departmentHeader}>Department</div>
                    {allKPIs.slice(0, 15).map(kpi => (
                        <div key={kpi} className={styles.kpiHeader} title={kpi}>
                            {kpi.length > 15 ? kpi.substring(0, 12) + '...' : kpi}
                        </div>
                    ))}
                </div>

                {heatmapData.map(dept => (
                    <div
                        key={dept.department_id}
                        className={styles.heatmapRow}
                        onClick={() => setSelectedDepartment(dept)}
                    >
                        <div className={styles.departmentCell}>
                            <span className={styles.departmentName}>{dept.department_name}</span>
                            <span className={styles.deptScore}>{dept.overall_score?.toFixed(1)}%</span>
                        </div>
                        {allKPIs.slice(0, 15).map(kpi => {
                            const kpiData = dept.kpis.find(k => k.kpi_name === kpi);
                            const score = kpiData?.average_score || 0;
                            return (
                                <div
                                    key={kpi}
                                    className={`${styles.scoreCell} ${styles[getScoreIntensity(score)]}`}
                                    style={{ backgroundColor: getScoreColor(score) }}
                                    title={`${dept.department_name} - ${kpi}: ${score.toFixed(1)}%`}
                                >
                                    {score > 0 ? `${score.toFixed(0)}%` : '-'}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {selectedDepartment && (
                <div className={styles.modal} onClick={() => setSelectedDepartment(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedDepartment.department_name}</h3>
                        <div className={styles.modalScore}>
                            Overall Score: <strong>{selectedDepartment.overall_score?.toFixed(1)}%</strong>
                        </div>
                        <div className={styles.modalKPIs}>
                            <h4>KPI Breakdown</h4>
                            {selectedDepartment.kpis.map(kpi => (
                                <div key={kpi.kpi_id} className={styles.modalKPI}>
                                    <span className={styles.modalKPIName}>{kpi.kpi_name}</span>
                                    <span
                                        className={styles.modalKPIScore}
                                        style={{ color: getScoreColor(kpi.average_score) }}
                                    >
                                        {kpi.average_score?.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setSelectedDepartment(null)} className={styles.closeButton}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

PerformanceHeatmap.propTypes = {
    tenantId: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    refreshTrigger: PropTypes.number,
};

export default PerformanceHeatmap;
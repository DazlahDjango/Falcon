import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart } from '../common/KPIChart';
import analyticsService from '../../../services/kpi/analytics.service';
import styles from './DepartmentPerformanceReport.module.css';

const DepartmentPerformanceReport = ({ tenantId, year, month, refreshTrigger }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchDepartments();
    }, [year, month, refreshTrigger, limit]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await analyticsService.getDepartmentRollupsByRanking(year, month, limit);
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch department rollups:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        return {
            labels: departments.map(d => d.department_name?.length > 15 ? d.department_name.substring(0, 15) + '...' : d.department_name),
            datasets: [{
                label: 'Overall Score (%)',
                data: departments.map(d => d.overall_score || 0),
                color: '#3b82f6',
            }]
        };
    };

    const getScoreClass = (score) => {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 70) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading department data...</p>
            </div>
        );
    }

    if (departments.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No department data available for the selected period.</p>
            </div>
        );
    }

    return (
        <div className={styles.departmentReport}>
            <div className={styles.header}>
                <h3>Department Performance Ranking</h3>
                <div className={styles.limitSelect}>
                    <label>Show: </label>
                    <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={50}>Top 50</option>
                        <option value={100}>All</option>
                    </select>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <BarChart data={getChartData()} height={400} />
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div>Rank</div>
                    <div>Department</div>
                    <div>Overall Score</div>
                    <div>Employees</div>
                    <div>Status Distribution</div>
                </div>

                {departments.map((dept, index) => (
                    <div
                        key={dept.department_id || index}
                        className={styles.tableRow}
                        onClick={() => setSelectedDepartment(dept)}
                    >
                        <div className={styles.rank}>#{index + 1}</div>
                        <div className={styles.deptName}>{dept.department_name}</div>
                        <div className={`${styles.score} ${getScoreClass(dept.overall_score)}`}>
                            {dept.overall_score?.toFixed(1)}%
                        </div>
                        <div>{dept.employee_count || dept.member_count || 0}</div>
                        <div className={styles.distribution}>
                            <div className={styles.distributionBars}>
                                <div className={styles.greenBar} style={{ width: `${dept.green_percentage || 0}%` }} />
                                <div className={styles.yellowBar} style={{ width: `${dept.yellow_percentage || 0}%` }} />
                                <div className={styles.redBar} style={{ width: `${dept.red_percentage || 0}%` }} />
                            </div>
                            <div className={styles.distributionLabels}>
                                <span>🟢 {dept.green_percentage?.toFixed(0)}%</span>
                                <span>🟡 {dept.yellow_percentage?.toFixed(0)}%</span>
                                <span>🔴 {dept.red_percentage?.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedDepartment && (
                <div className={styles.modal} onClick={() => setSelectedDepartment(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedDepartment.department_name}</h3>
                        <div className={styles.modalStats}>
                            <div className={styles.modalStat}>
                                <label>Overall Score:</label>
                                <span className={getScoreClass(selectedDepartment.overall_score)}>
                                    {selectedDepartment.overall_score?.toFixed(1)}%
                                </span>
                            </div>
                            <div className={styles.modalStat}>
                                <label>Employees:</label>
                                <span>{selectedDepartment.employee_count || selectedDepartment.member_count || 0}</span>
                            </div>
                            <div className={styles.modalStat}>
                                <label>Green:</label>
                                <span>{selectedDepartment.green_percentage?.toFixed(1)}%</span>
                            </div>
                            <div className={styles.modalStat}>
                                <label>Yellow:</label>
                                <span>{selectedDepartment.yellow_percentage?.toFixed(1)}%</span>
                            </div>
                            <div className={styles.modalStat}>
                                <label>Red:</label>
                                <span>{selectedDepartment.red_percentage?.toFixed(1)}%</span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDepartment(null)} className={styles.closeButton}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

DepartmentPerformanceReport.propTypes = {
    tenantId: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    refreshTrigger: PropTypes.number,
};

export default DepartmentPerformanceReport;
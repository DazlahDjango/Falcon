import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DepartmentComparison from './DepartmentComparison';
import { BarChart } from '../../../common';
import analyticsService from '../../../../../services/kpi/analytics.service';
import styles from './DepartmentReports.module.css';

const DepartmentReports = ({ year, month, onError }) => {
    const [departmentRollups, setDepartmentRollups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 50,
        total: 0
    });
    
    useEffect(() => {
        fetchDepartmentRollups();
    }, [year, month]);
    
    const fetchDepartmentRollups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await analyticsService.getDepartmentRollups({ 
                year, 
                month,
                page: pagination.page,
                page_size: pagination.page_size
            });
            
            // Handle both paginated and non-paginated responses
            const results = response.results || response;
            const totalCount = response.count || results.length;
            
            setDepartmentRollups(results);
            setPagination(prev => ({
                ...prev,
                total: totalCount
            }));
        } catch (error) {
            console.error('Failed to fetch department rollups:', error);
            setError(error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleNextPage = () => {
        if (pagination.page * pagination.page_size < pagination.total) {
            setPagination(prev => ({ ...prev, page: prev.page + 1 }));
        }
    };
    
    const handlePrevPage = () => {
        if (pagination.page > 1) {
            setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
    };
    const getDepartmentChartData = () => {
        const sorted = [...departmentRollups].sort((a, b) => b.overall_score - a.overall_score);
        return {
            labels: sorted.map(d => d.department_name.length > 15 ? d.department_name.substring(0, 15) + '...' : d.department_name),
            datasets: [
                {
                    label: 'Overall Score (%)',
                    data: sorted.map(d => d.overall_score),
                    color: '#3b82f6',
                }
            ],
            yAxisLabel: 'Score (%)'
        };
    };
    const getStatusDistributionData = () => {
        const totalEmployees = departmentRollups.reduce((sum, d) => sum + d.employee_count, 0);
        const greenEmployees = departmentRollups.reduce((sum, d) => sum + (d.green_percentage / 100 * d.employee_count), 0);
        const redEmployees = departmentRollups.reduce((sum, d) => sum + (d.red_percentage / 100 * d.employee_count), 0);
        return {
            labels: ['On Track', 'At Risk', 'Off Track'],
            values: [greenEmployees, yellowEmployees, redEmployees],
            colors: ['#22c55e', '#eab308', '#ef4444']
        };
    };
    const selectedDeptData = departmentRollups.find(d => d.department_id === selectedDepartment);
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading department reports...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>
                    <h3>Failed to Load Department Reports</h3>
                    <p>{error.message || 'An error occurred while fetching department data'}</p>
                    <button onClick={fetchDepartmentRollups} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    if (!departmentRollups || departmentRollups.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <p>No department data available for the selected period.</p>
                <button onClick={fetchDepartmentRollups} className={styles.retryButton}>
                    Reload
                </button>
            </div>
        );
    }
    return (
        <div className={styles.departmentReports}>
            <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{departmentRollups.length}</div>
                    <div className={styles.statLabel}>Departments</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {(departmentRollups.reduce((sum, d) => sum + d.overall_score, 0) / departmentRollups.length || 0).toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>Avg Department Score</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {departmentRollups.filter(d => d.overall_score >= 90).length}
                    </div>
                    <div className={styles.statLabel}>Top Departments</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {departmentRollups.filter(d => d.overall_score < 50).length}
                    </div>
                    <div className={styles.statLabel}>Needs Improvement</div>
                </div>
            </div>

            <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                    <h4>Department Performance Ranking</h4>
                    <BarChart data={getDepartmentChartData()} height={300} />
                </div>
                <div className={styles.chartCard}>
                    <h4>Organization Status Distribution</h4>
                    <DepartmentComparison data={getStatusDistributionData()} type="pie" />
                </div>
            </div>

            <div className={styles.departmentSelector}>
                <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={styles.departmentSelect}
                >
                    <option value="">Select Department for Details</option>
                    {departmentRollups.map(dept => (
                        <option key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedDeptData && (
                <div className={styles.departmentDetail}>
                    <h3>{selectedDeptData.department_name}</h3>
                    <div className={styles.detailStats}>
                        <div className={styles.detailStat}>
                            <span className={styles.detailLabel}>Overall Score:</span>
                            <span className={`${styles.detailValue} ${getScoreClass(selectedDeptData.overall_score)}`}>
                                {selectedDeptData.overall_score.toFixed(1)}%
                            </span>
                        </div>
                        <div className={styles.detailStat}>
                            <span className={styles.detailLabel}>Employees:</span>
                            <span className={styles.detailValue}>{selectedDeptData.employee_count}</span>
                        </div>
                        <div className={styles.detailStat}>
                            <span className={styles.detailLabel}>Green:</span>
                            <span className={styles.detailValue}>{selectedDeptData.green_percentage.toFixed(1)}%</span>
                        </div>
                        <div className={styles.detailStat}>
                            <span className={styles.detailLabel}>Yellow:</span>
                            <span className={styles.detailValue}>{selectedDeptData.yellow_percentage.toFixed(1)}%</span>
                        </div>
                        <div className={styles.detailStat}>
                            <span className={styles.detailLabel}>Red:</span>
                            <span className={styles.detailValue}>{selectedDeptData.red_percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.departmentTable}>
                <div className={styles.tableHeader}>
                    <div>Department</div>
                    <div>Score</div>
                    <div>Employees</div>
                    <div>Status Distribution</div>
                </div>
                {departmentRollups.map(dept => (
                    <div key={dept.department_id} className={styles.tableRow}>
                        <div className={styles.deptName}>{dept.department_name}</div>
                        <div className={`${styles.scoreValue} ${getScoreClass(dept.overall_score)}`}>
                            {dept.overall_score.toFixed(1)}%
                        </div>
                        <div>{dept.employee_count}</div>
                        <div className={styles.statusDistribution}>
                            <span className={styles.greenBar} style={{ width: `${dept.green_percentage}%` }} />
                            <span className={styles.yellowBar} style={{ width: `${dept.yellow_percentage}%` }} />
                            <span className={styles.redBar} style={{ width: `${dept.red_percentage}%` }} />
                            <div className={styles.statusLabels}>
                                <span>🟢 {dept.green_percentage.toFixed(0)}%</span>
                                <span>🟡 {dept.yellow_percentage.toFixed(0)}%</span>
                                <span>🔴 {dept.red_percentage.toFixed(0)}%</span>
                            </div>
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
DepartmentReports.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    onError: PropTypes.func,
};
export default DepartmentReports;
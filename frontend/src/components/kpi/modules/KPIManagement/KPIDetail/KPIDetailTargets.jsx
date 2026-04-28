import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import targetService from '../../../../../services/kpi/target.service';
import styles from './KPIDetail.module.css';

const KPIDetailTargets = ({ kpiId }) => {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    useEffect(() => {
        fetchTargets();
    }, [kpiId, selectedYear]);
    const fetchTargets = async () => {
        setLoading(true);
        try {
            const response = await targetService.getTargets({ kpi: kpiId, year: selectedYear });
            setTargets(response.results || []);
        } catch (error) {
            console.error('Failed to fetch targets:', error);
        } finally {
            setLoading(false);
        }
    };
    const years = [2023, 2024, 2025, 2026];
    if (loading) {
        return <div className={styles.loadingSmall}>Loading targets...</div>;
    }
    if (targets.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No targets set for this KPI</p>
            </div>
        );
    }
    return (
        <div className={styles.targetsSection}>
            <div className={styles.sectionHeader}>
                <h3>Annual Targets</h3>
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

            <div className={styles.targetsTable}>
                <div className={styles.tableHeader}>
                    <div>User</div>
                    <div>Target Value</div>
                    <div>Status</div>
                    <div>Approved By</div>
                </div>
                {targets.map(target => (
                    <div key={target.id} className={styles.tableRow}>
                        <div>{target.user_email || target.user}</div>
                        <div className={styles.targetValue}>
                            {target.target_value} {target.unit}
                        </div>
                        <div>
                            {target.approved_by ? (
                                <span className={styles.approvedBadge}>Approved</span>
                            ) : (
                                <span className={styles.pendingBadge}>Pending</span>
                            )}
                        </div>
                        <div>{target.approved_by_email || '—'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
KPIDetailTargets.propTypes = {
    kpiId: PropTypes.string.isRequired,
};
export default KPIDetailTargets;
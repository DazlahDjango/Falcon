import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { actualService } from '../../../../../services/kpi/actual.service';
import { TrafficLight } from '../../../common';
import styles from './KPIDetail.module.css';

const KPIDetailActuals = ({ kpiId }) => {
    const [actuals, setActuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    useEffect(() => {
        fetchActuals();
    }, [kpiId, selectedYear]);
    const fetchActuals = async () => {
        setLoading(true);
        try {
            const response = await actualService.getActuals({ kpi: kpiId, year: selectedYear });
            setActuals(response.results || []);
        } catch (error) {
            console.error('Failed to fetch actuals:', error);
        } finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className={styles.approvedBadge}>Approved</span>;
            case 'REJECTED':
                return <span className={styles.rejectedBadge}>Rejected</span>;
            case 'PENDING':
                return <span className={styles.pendingBadge}>Pending</span>;
            default:
                return <span className={styles.draftBadge}>{status}</span>;
        }
    };
    const years = [2023, 2024, 2025, 2026];
    if (loading) {
        return <div className={styles.loadingSmall}>Loading actual data...</div>;
    }
    if (actuals.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No actual data available for this KPI</p>
            </div>
        );
    }
    return (
        <div className={styles.actualsSection}>
            <div className={styles.sectionHeader}>
                <h3>Actual Performance Data</h3>
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
            <div className={styles.actualsTable}>
                <div className={styles.tableHeader}>
                    <div>Month</div>
                    <div>User</div>
                    <div>Actual Value</div>
                    <div>Status</div>
                    <div>Submitted</div>
                </div>
                {actuals.map(actual => (
                    <div key={actual.id} className={styles.tableRow}>
                        <div>{new Date(selectedYear, actual.month - 1).toLocaleString('default', { month: 'short' })}</div>
                        <div>{actual.user_email || actual.user}</div>
                        <div className={styles.actualValue}>
                            {actual.actual_value} {actual.unit}
                        </div>
                        <div>{getStatusBadge(actual.status)}</div>
                        <div>{actual.submitted_at ? new Date(actual.submitted_at).toLocaleDateString() : '—'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
KPIDetailActuals.propTypes = {
    kpiId: PropTypes.string.isRequired,
};
export default KPIDetailActuals;
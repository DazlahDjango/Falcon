import React from 'react';
import PropTypes from 'prop-types';
import { formatScore, formatTrafficLight, getTrafficLightColor } from '../../../utils/kpi';
import styles from './DataTable.module.css';

const ScoreTable = ({ data, onRowClick, loading, showUser = true, showKPI = true }) => {
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading...</p>
            </div>
        );
    }
    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <p>No score data available</p>
            </div>
        );
    }
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Period</th>
                        {showKPI && <th>KPI</th>}
                        {showUser && <th>User</th>}
                        <th>Score</th>
                        <th>Status</th>
                        <th>Actual</th>
                        <th>Target</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((score) => (
                        <tr 
                            key={score.id} 
                            onClick={() => onRowClick?.(score.id)}
                            className={styles.clickableRow}
                        >
                            <td>{`${score.year}-${String(score.month).padStart(2, '0')}`}</td>
                            {showKPI && <td>{score.kpi_name}</td>}
                            {showUser && <td>{score.user_name || score.user_email}</td>}
                            <td className={styles.scoreValue}>
                                {formatScore(score.score)}
                            </td>
                            <td>
                                <span 
                                    className={styles.statusBadge}
                                    style={{ backgroundColor: getTrafficLightColor(score.traffic_light?.status) }}
                                >
                                    {formatTrafficLight(score.traffic_light?.status, false)}
                                </span>
                            </td>
                            <td>{score.actual_value}</td>
                            <td>{score.target_value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
ScoreTable.propTypes = {
    data: PropTypes.array,
    onRowClick: PropTypes.func,
    loading: PropTypes.bool,
    showUser: PropTypes.bool,
    showKPI: PropTypes.bool,
};
ScoreTable.defaultProps = {
    data: [],
    loading: false,
    showUser: true,
    showKPI: true,
};
export default ScoreTable;
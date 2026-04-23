import React from 'react';
import PropTypes from 'prop-types';
import styles from './DataTable.module.css';

const TargetTable = ({ data, onRowClick, loading, showUser = true, showKPI = true }) => {
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
                <p>No target data available</p>
            </div>
        );
    }
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Year</th>
                        {showKPI && <th>KPI</th>}
                        {showUser && <th>User</th>}
                        <th>Target Value</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((target) => (
                        <tr 
                            key={target.id} 
                            onClick={() => onRowClick?.(target.id)}
                            className={styles.clickableRow}
                        >
                            <td>{target.year}</td>
                            {showKPI && <td>{target.kpi_name}</td>}
                            {showUser && <td>{target.user_email || target.user}</td>}
                            <td className={styles.targetValue}>
                                {target.target_value} {target.unit}
                            </td>
                            <td>
                                <span className={target.approved_by ? styles.approvedBadge : styles.pendingBadge}>
                                    {target.approved_by ? 'Approved' : 'Pending'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
TargetTable.propTypes = {
    data: PropTypes.array,
    onRowClick: PropTypes.func,
    loading: PropTypes.bool,
    showUser: PropTypes.bool,
    showKPI: PropTypes.bool,
};
TargetTable.defaultProps = {
    data: [],
    loading: false,
    showUser: true,
    showKPI: true,
};
export default TargetTable;
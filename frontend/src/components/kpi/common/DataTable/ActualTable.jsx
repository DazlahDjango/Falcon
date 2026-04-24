import React from 'react';
import PropTypes from 'prop-types';
import { VALIDATION_STATUS } from '../../../utils/kpi/constants';
import styles from './DataTable.module.css';

const ActualTable = ({ data, onRowClick, loading, showUser = true, showKPI = true }) => {
    const getStatusBadge = (status) => {
        const config = VALIDATION_STATUS[status];
        return (
            <span 
                className={styles.statusBadge}
                style={{ backgroundColor: config?.color || '#6b7280' }}
            >
                {config?.label || status}
            </span>
        );
    };
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
                <p>No actual data available</p>
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
                        <th>Actual Value</th>
                        <th>Status</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((actual) => (
                        <tr 
                            key={actual.id} 
                            onClick={() => onRowClick?.(actual.id)}
                            className={styles.clickableRow}
                        >
                            <td>{`${actual.year}-${String(actual.month).padStart(2, '0')}`}</td>
                            {showKPI && <td>{actual.kpi_name}</td>}
                            {showUser && <td>{actual.user_email || actual.user}</td>}
                            <td className={styles.actualValue}>
                                {actual.actual_value} {actual.unit}
                            </td>
                            <td>{getStatusBadge(actual.status)}</td>
                            <td>{actual.submitted_at ? new Date(actual.submitted_at).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
ActualTable.propTypes = {
    data: PropTypes.array,
    onRowClick: PropTypes.func,
    loading: PropTypes.bool,
    showUser: PropTypes.bool,
    showKPI: PropTypes.bool,
};
ActualTable.defaultProps = {
    data: [],
    loading: false,
    showUser: true,
    showKPI: true,
};
export default ActualTable;
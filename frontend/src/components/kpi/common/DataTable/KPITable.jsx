import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatKPIType, formatTrafficLight } from '../../../../utils/kpi';
import styles from './DataTable.module.css';

const KPITable = ({ data, onRowClick, loading, emptyMessage }) => {
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const sortedData = [...data].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortDirection === 'desc') {
            [aVal, bVal] = [bVal, aVal];
        }
        if (typeof aVal === 'string') {
            return aVal.localeCompare(bVal);
        }
        return (aVal || 0) - (bVal || 0);
    });
    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
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
                <p>{emptyMessage || 'No data available'}</p>
            </div>
        );
    }
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')}>
                            Name {getSortIcon('name')}
                        </th>
                        <th onClick={() => handleSort('code')}>
                            Code {getSortIcon('code')}
                        </th>
                        <th onClick={() => handleSort('kpiType')}>
                            Type {getSortIcon('kpiType')}
                        </th>
                        <th onClick={() => handleSort('owner')}>
                            Owner {getSortIcon('owner')}
                        </th>
                        <th onClick={() => handleSort('isActive')}>
                            Status {getSortIcon('isActive')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((kpi) => (
                        <tr 
                            key={kpi.id} 
                            onClick={() => onRowClick?.(kpi.id)}
                            className={styles.clickableRow}
                        >
                            <td className={styles.kpiName}>{kpi.name}</td>
                            <td className={styles.kpiCode}>{kpi.code}</td>
                            <td>{formatKPIType(kpi.kpiType)}</td>
                            <td>{kpi.owner_email || kpi.owner}</td>
                            <td>
                                <span className={kpi.isActive ? styles.activeBadge : styles.inactiveBadge}>
                                    {kpi.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
KPITable.propTypes = {
    data: PropTypes.array,
    onRowClick: PropTypes.func,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string,
};
KPITable.defaultProps = {
    data: [],
    loading: false,
};
export default KPITable;
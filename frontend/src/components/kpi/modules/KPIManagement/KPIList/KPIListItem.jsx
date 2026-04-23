import React from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../../../common';
import styles from './KPIList.module.css';

const KPIListItem = ({ kpi, onSelect }) => {
    const getKpiTypeLabel = (type) => {
        const types = {
            COUNT: 'Count',
            PERCENTAGE: 'Percentage',
            FINANCIAL: 'Financial',
            MILESTONE: 'Milestone',
            TIME: 'Time',
            IMPACT: 'Impact'
        };
        return types[type] || type;
    };
    const getStatusBadge = () => {
        if (kpi.isActive) {
            return <span className={styles.activeBadge}>Active</span>;
        }
        return <span className={styles.inactiveBadge}>Inactive</span>;
    };
    return (
        <div className={styles.listItem} onClick={onSelect}>
            <div className={styles.itemCell}>
                <div className={styles.nameInfo}>
                    <span className={styles.kpiName}>{kpi.name}</span>
                    <span className={styles.kpiCode}>{kpi.code}</span>
                </div>
            </div>
            <div className={styles.itemCell}>
                <span className={styles.kpiType}>{getKpiTypeLabel(kpi.kpiType)}</span>
            </div>
            <div className={styles.itemCell}>
                <span className={styles.ownerEmail}>{kpi.owner_email || kpi.owner}</span>
            </div>
            <div className={styles.itemCell}>
                {getStatusBadge()}
            </div>
            <div className={styles.itemCell}>
                <button className={styles.viewButton}>View</button>
            </div>
        </div>
    );
};
KPIListItem.propTypes = {
    kpi: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        kpiType: PropTypes.string,
        owner: PropTypes.string,
        owner_email: PropTypes.string,
        isActive: PropTypes.bool,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};
export default KPIListItem;
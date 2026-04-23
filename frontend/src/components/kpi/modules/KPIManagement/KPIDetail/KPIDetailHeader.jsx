import React from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../../../common';
import styles from './KPIDetail.module.css';

const KPIDetailHeader = ({ kpi, onBack, onEdit, onManageWeights, onActivate, onDeactivate }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <button onClick={onBack} className={styles.backButton}>
                    ← Back
                </button>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{kpi.name}</h1>
                    <span className={styles.code}>{kpi.code}</span>
                </div>
            </div>
            <div className={styles.headerRight}>
                <button onClick={onEdit} className={styles.actionButton}>
                    ✎ Edit
                </button>
                <button onClick={onManageWeights} className={styles.actionButton}>
                    ⚖️ Weights
                </button>
                {kpi.isActive ? (
                    <button onClick={onDeactivate} className={`${styles.actionButton} ${styles.dangerButton}`}>
                        Deactivate
                    </button>
                ) : (
                    <button onClick={onActivate} className={`${styles.actionButton} ${styles.successButton}`}>
                        Activate
                    </button>
                )}
            </div>
        </div>
    );
};
KPIDetailHeader.propTypes = {
    kpi: PropTypes.shape({
        name: PropTypes.string,
        code: PropTypes.string,
        isActive: PropTypes.bool,
    }).isRequired,
    onBack: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onManageWeights: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
};
export default KPIDetailHeader;
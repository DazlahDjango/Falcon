import React from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../../../common';
import styles from './KPIDetail.module.css';

const KPIDetailInfo = ({ kpi }) => {
    const getKpiTypeLabel = (type) => {
        const types = {
            COUNT: 'Count / Number',
            PERCENTAGE: 'Percentage (%)',
            FINANCIAL: 'Financial Amount',
            MILESTONE: 'Yes / No Milestone',
            TIME: 'Time / Turnaround',
            IMPACT: 'Impact Score'
        };
        return types[type] || type;
    };
    const getCalculationLogicLabel = (logic) => {
        if (logic === 'HIGHER_IS_BETTER') return 'Higher is Better';
        return 'Lower is Better';
    };
    const getMeasureTypeLabel = (type) => {
        if (type === 'CUMULATIVE') return 'Cumulative (YTD)';
        return 'Non-Cumulative (Period Only)';
    };
    return (
        <div className={styles.infoSection}>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <label>Description</label>
                    <p>{kpi.description || 'No description provided'}</p>
                </div>
                
                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <label>KPI Type</label>
                        <span>{getKpiTypeLabel(kpi.kpiType)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Calculation Logic</label>
                        <span>{getCalculationLogicLabel(kpi.calculationLogic)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Measure Type</label>
                        <span>{getMeasureTypeLabel(kpi.measureType)}</span>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <label>Unit</label>
                        <span>{kpi.unit || 'Not specified'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Decimal Places</label>
                        <span>{kpi.decimalPlaces}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Status</label>
                        <span className={kpi.isActive ? styles.activeStatus : styles.inactiveStatus}>
                            {kpi.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <label>Target Range</label>
                        <span>
                            {kpi.targetMin !== null ? kpi.targetMin : '—'} 
                            {' to '}
                            {kpi.targetMax !== null ? kpi.targetMax : '—'}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Strategic Objective</label>
                        <span>{kpi.strategicObjective || 'Not linked'}</span>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <label>Framework</label>
                        <span>{kpi.framework_name || kpi.framework}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Sector</label>
                        <span>{kpi.sector_name || kpi.sector}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Category</label>
                        <span>{kpi.category_name || kpi.category || 'Uncategorized'}</span>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <label>Owner</label>
                        <span>{kpi.owner_email || kpi.owner}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Department</label>
                        <span>{kpi.department_name || kpi.department || 'Not assigned'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Created</label>
                        <span>{new Date(kpi.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {kpi.formula && Object.keys(kpi.formula).length > 0 && (
                    <div className={styles.infoItem}>
                        <label>Custom Formula</label>
                        <pre className={styles.formula}>{JSON.stringify(kpi.formula, null, 2)}</pre>
                    </div>
                )}

                {kpi.metadata && Object.keys(kpi.metadata).length > 0 && (
                    <div className={styles.infoItem}>
                        <label>Metadata</label>
                        <pre className={styles.metadata}>{JSON.stringify(kpi.metadata, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};
KPIDetailInfo.propTypes = {
    kpi: PropTypes.object.isRequired,
};
export default KPIDetailInfo;
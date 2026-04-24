import React from 'react';
import PropTypes from 'prop-types';
import styles from './KPICreate.module.css';

const KPICreateStep3 = ({ data, onSubmit, onBack, onCancel, loading }) => {
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
        if (logic === 'HIGHER_IS_BETTER') return 'Higher is Better (Actual ÷ Target × 100)';
        return 'Lower is Better (Target ÷ Actual × 100)';
    };
    const getMeasureTypeLabel = (type) => {
        if (type === 'CUMULATIVE') return 'Cumulative (YTD) - Values add up over time';
        return 'Non-Cumulative - Period-only values';
    };
    return (
        <div className={styles.step}>
            <h3>Review KPI Details</h3>
            <p className={styles.reviewNote}>Please review the information below before creating the KPI.</p>
            <div className={styles.reviewSection}>
                <h4>Basic Information</h4>
                <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                        <label>Name</label>
                        <span>{data.name || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Code</label>
                        <span>{data.code || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Description</label>
                        <span>{data.description || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>KPI Type</label>
                        <span>{getKpiTypeLabel(data.kpiType)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Calculation Logic</label>
                        <span>{getCalculationLogicLabel(data.calculationLogic)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Measure Type</label>
                        <span>{getMeasureTypeLabel(data.measureType)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Unit</label>
                        <span>{data.unit || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Framework</label>
                        <span>{data.frameworkId || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Sector</label>
                        <span>{data.sectorId || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Category</label>
                        <span>{data.categoryId || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Owner</label>
                        <span>{data.ownerId || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Department</label>
                        <span>{data.departmentId || '—'}</span>
                    </div>
                </div>
            </div>
            <div className={styles.reviewSection}>
                <h4>Target Settings</h4>
                <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                        <label>Target Range</label>
                        <span>{data.targetMin || '—'} to {data.targetMax || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Decimal Places</label>
                        <span>{data.decimalPlaces}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Strategic Objective</label>
                        <span>{data.strategicObjective || '—'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Status</label>
                        <span className={data.isActive ? styles.activeStatus : styles.inactiveStatus}>
                            {data.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton} disabled={loading}>
                    Cancel
                </button>
                <button onClick={onBack} className={styles.backButton} disabled={loading}>
                    ← Back
                </button>
                <button onClick={() => onSubmit({})} className={styles.submitButton} disabled={loading}>
                    {loading ? 'Creating...' : 'Create KPI'}
                </button>
            </div>
        </div>
    );
};
KPICreateStep3.propTypes = {
    data: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};
export default KPICreateStep3;
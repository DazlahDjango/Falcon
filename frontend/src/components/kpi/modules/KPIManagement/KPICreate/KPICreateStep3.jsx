import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './KPICreate.module.css';

const KPICreateStep3 = ({ data, onSubmit, onBack, onCancel, loading }) => {
    // Get names for IDs from store
    const sectors = useSelector(state => state.framework.sectors.items);
    const frameworks = useSelector(state => state.framework.frameworks.items);
    const categories = useSelector(state => state.framework.categories.items);
    const users = useSelector(state => state.users.users);

    const getSectorName = (id) => sectors.find(s => s.id == id)?.name || id;
    const getFrameworkName = (id) => frameworks.find(f => f.id == id)?.name || id;
    const getCategoryName = (id) => categories.find(c => c.id == id)?.name || id;
    const getOwnerName = (id) => {
        const user = users.find(u => u.id == id);
        return user ? `${user.first_name} ${user.last_name}` : id;
    };

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
        return 'Non-Cumulative';
    };

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h3>Review & Confirm</h3>
                <p>Please double-check the details before creating the KPI.</p>
            </div>

            <div className={styles.reviewSection}>
                <h4>Core Identity</h4>
                <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                        <label>Name</label>
                        <span>{data.name}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Code</label>
                        <span>{data.code}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Owner</label>
                        <span>{getOwnerName(data.ownerId)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Framework</label>
                        <span>{getFrameworkName(data.frameworkId)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Sector</label>
                        <span>{getSectorName(data.sectorId)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Category</label>
                        <span>{getCategoryName(data.categoryId) || 'None'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.reviewSection}>
                <h4>Logic & Configuration</h4>
                <div className={styles.reviewGrid}>
                    <div className={styles.reviewItem}>
                        <label>KPI Type</label>
                        <span>{getKpiTypeLabel(data.kpiType)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Calculation</label>
                        <span>{getCalculationLogicLabel(data.calculationLogic)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Measure Type</label>
                        <span>{getMeasureTypeLabel(data.measureType)}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Unit</label>
                        <span>{data.unit || 'No unit'}</span>
                    </div>
                    <div className={styles.reviewItem}>
                        <label>Target Range</label>
                        <span>{data.targetMin || '0'} — {data.targetMax || '∞'}</span>
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
                <button
                    onClick={() => onSubmit({})}
                    className={styles.submitButton}
                    disabled={loading}
                >
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
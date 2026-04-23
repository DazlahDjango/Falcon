import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PhasingForm from './PhasingForm';
import styles from './TargetForm.module.css';

const TargetForm = ({ 
    kpi, 
    initialTarget, 
    year,
    onSubmit, 
    onCancel, 
    isLoading,
    showPhasing
}) => {
    const [targetValue, setTargetValue] = useState(initialTarget?.targetValue || '');
    const [phasingStrategy, setPhasingStrategy] = useState('equal_split');
    const [phasingParams, setPhasingParams] = useState({});
    const [error, setError] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = parseFloat(targetValue);
        if (isNaN(value) || value <= 0) {
            setError('Please enter a valid positive value');
            return;
        }
        setError('');
        onSubmit({
            targetValue: value,
            phasing: showPhasing ? {
                strategy: phasingStrategy,
                params: phasingParams
            } : null
        });
    };
    const formatCurrency = (value) => {
        if (kpi?.kpiType === 'FINANCIAL') {
            return `KES ${value.toLocaleString()}`;
        }
        if (kpi?.kpiType === 'PERCENTAGE') {
            return `${value}%`;
        }
        return value;
    };
    return (
        <form onSubmit={handleSubmit} className={styles.targetForm}>
            <div className={styles.header}>
                <h3>Set Annual Target</h3>
                <div className={styles.kpiInfo}>
                    <span className={styles.kpiName}>{kpi?.name}</span>
                    <span className={styles.kpiCode}>{kpi?.code}</span>
                </div>
            </div>

            <div className={styles.formContent}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Year <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        value={year}
                        readOnly
                        disabled
                        className={styles.inputDisabled}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Annual Target Value <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.targetInput}>
                        <input
                            type="number"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            placeholder="Enter target value"
                            className={`${styles.input} ${error ? styles.error : ''}`}
                            step={kpi?.kpiType === 'FINANCIAL' ? '0.01' : '1'}
                            min="0"
                        />
                        {kpi?.unit && <span className={styles.unit}>{kpi.unit}</span>}
                    </div>
                    {error && <span className={styles.errorText}>{error}</span>}
                    {kpi?.targetMin && kpi?.targetMax && (
                        <small className={styles.hint}>
                            Recommended range: {formatCurrency(kpi.targetMin)} - {formatCurrency(kpi.targetMax)}
                        </small>
                    )}
                </div>

                {showPhasing && targetValue && (
                    <PhasingForm
                        annualTarget={parseFloat(targetValue)}
                        kpi={kpi}
                        onStrategyChange={setPhasingStrategy}
                        onParamsChange={setPhasingParams}
                    />
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={styles.cancelButton}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : (initialTarget ? 'Update Target' : 'Create Target')}
                </button>
            </div>
        </form>
    );
};
TargetForm.propTypes = {
    kpi: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        kpiType: PropTypes.string,
        unit: PropTypes.string,
        targetMin: PropTypes.number,
        targetMax: PropTypes.number,
    }),
    initialTarget: PropTypes.shape({
        targetValue: PropTypes.number,
    }),
    year: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    showPhasing: PropTypes.bool,
};
TargetForm.defaultProps = {
    isLoading: false,
    showPhasing: true,
};
export default TargetForm;
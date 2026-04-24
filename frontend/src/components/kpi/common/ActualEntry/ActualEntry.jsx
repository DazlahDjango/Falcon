import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ActualEntryForm from './ActualEntryForm';
import EvidenceUpload from './EvidenceUpload';
import styles from './ActualEntry.module.css';

const ActualEntry = ({ 
    kpi, 
    year, 
    month, 
    initialValue, 
    initialNotes,
    initialEvidence,
    onSubmit, 
    onCancel, 
    isLoading 
}) => {
    const [actualValue, setActualValue] = useState(initialValue || '');
    const [notes, setNotes] = useState(initialNotes || '');
    const [evidence, setEvidence] = useState(initialEvidence || []);
    const [error, setError] = useState('');
    const handlSubmit = (e) => {
        e.preventDefault();
        const value = parseFloat(actualValue);
        if (isNaN(value)) {
            setError('Please enter a valid numeric value');
            return;
        }
        if (value < 0) {
            setError('Actual value cannot be negative');
            return;
        }
        setError('');
        onSubmit({
            actualValue: value,
            notes,
            evidence
        });
    };
    const formatTarget = () => {
        if (!kpi?.targetValue) return 'Target not set';
        return `${kpi.targetValue} ${kpi.unit || ''}`;
    };
    return (
        <div className={styles.actualEntry}>
            <div className={styles.header}>
                <h3>Enter Performance Data</h3>
                <div className={styles.kpiInfo}>
                    <span className={styles.kpiName}>{kpi?.name}</span>
                    <span className={styles.kpiCode}>{kpi?.code}</span>
                </div>
            </div>

            <div className={styles.periodInfo}>
                <div className={styles.period}>
                    <span className={styles.label}>Period:</span>
                    <span className={styles.value}>
                        {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.target}>
                    <span className={styles.label}>Target:</span>
                    <span className={styles.value}>{formatTarget()}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <ActualEntryForm
                    value={actualValue}
                    onChange={setActualValue}
                    notes={notes}
                    onNotesChange={setNotes}
                    unit={kpi?.unit}
                    kpiType={kpi?.kpiType}
                    error={error}
                />

                <EvidenceUpload
                    evidence={evidence}
                    onChange={setEvidence}
                    disabled={isLoading}
                />

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
                        {isLoading ? 'Submitting...' : (initialValue ? 'Update Entry' : 'Submit for Validation')}
                    </button>
                </div>
            </form>
        </div>
    );
};
ActualEntry.propTypes = {
    kpi: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
        unit: PropTypes.string,
        kpiType: PropTypes.string,
        targetValue: PropTypes.number,
    }),
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    initialValue: PropTypes.number,
    initialNotes: PropTypes.string,
    initialEvidence: PropTypes.array,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
ActualEntry.defaultProps = {
    isLoading: false,
};
export default ActualEntry;
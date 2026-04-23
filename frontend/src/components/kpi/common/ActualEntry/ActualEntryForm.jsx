import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActualEntry.module.css';

const ActualEntryForm = ({ value, onChange, notes, onNotesChange, unit, kpiType, error }) => {
    const getPlaceholder = () => {
        switch (kpiType) {
            case 'PERCENTAGE':
                return 'Enter percentage (e.g., 85)';
            case 'FINANCIAL':
                return 'Enter amount in KES';
            case 'COUNT':
                return 'Enter number';
            case 'TIME':
                return 'Enter time in days';
            default:
                return 'Enter value';
        }
    };

    const getStep = () => {
        switch (kpiType) {
            case 'FINANCIAL':
                return '0.01';
            case 'PERCENTAGE':
                return '0.1';
            default:
                return '1';
        }
    };
    const formatDisplay = (val) => {
        if (!val) return '';
        if (kpiType === 'FINANCIAL') {
            return new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES'
            }).format(val);
        }
        if (kpiType === 'PERCENTAGE') {
            return `${val}%`;
        }
        return val;
    };
    return (
        <div>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    Actual Value <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={getPlaceholder()}
                        className={`${styles.valueInput} ${error ? styles.error : ''}`}
                        step={getStep()}
                        min="0"
                    />
                    {unit && <span className={styles.unit}>{unit}</span>}
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
                {value && (
                    <small className={styles.hint}>
                        You entered: {formatDisplay(value)}
                    </small>
                )}
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Add any notes about this entry, e.g., explanation of results, assumptions, etc."
                    className={styles.textarea}
                    rows={3}
                />
            </div>
        </div>
    );
};
ActualEntryForm.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    notes: PropTypes.string,
    onNotesChange: PropTypes.func.isRequired,
    unit: PropTypes.string,
    kpiType: PropTypes.string,
    error: PropTypes.string,
};
ActualEntryForm.defaultProps = {
    value: '',
    notes: '',
};
export default ActualEntryForm
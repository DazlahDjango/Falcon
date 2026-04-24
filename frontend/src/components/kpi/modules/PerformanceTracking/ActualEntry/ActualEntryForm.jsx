import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EvidenceUpload } from '../../../common';
import styles from './ActualEntryForm.module.css';

const ActualEntryForm = ({ kpi, existingActual, onSubmit, isLoading }) => {
    const [value, setValue] = useState(existingActual?.actual_value || '');
    const [notes, setNotes] = useState(existingActual?.notes || '');
    const [evidence, setEvidence] = useState([]);
    const [error, setError] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            setError('Please enter a valid number');
            return;
        }
        if (numValue < 0) {
            setError('Value cannot be negative');
            return;
        }
        setError('');
        onSubmit({
            actual_value: numValue,
            notes,
            evidence
        });
    };
    const getPlaceholder = () => {
        switch (kpi?.kpi_type) {
            case 'PERCENTAGE': return 'Enter percentage (e.g., 85)';
            case 'FINANCIAL': return 'Enter amount in KES';
            case 'COUNT': return 'Enter number';
            case 'TIME': return 'Enter time in days';
            default: return 'Enter value';
        }
    };
    const getStep = () => {
        switch (kpi?.kpi_type) {
            case 'FINANCIAL': return '0.01';
            case 'PERCENTAGE': return '0.1';
            default: return '1';
        }
    };
    const getStatusBadge = () => {
        if (!existingActual) return null;
        switch (existingActual.status) {
            case 'APPROVED':
                return <span className={`${styles.statusBadge} ${styles.approved}`}>✓ Approved</span>;
            case 'REJECTED':
                return <span className={`${styles.statusBadge} ${styles.rejected}`}>✗ Rejected</span>;
            case 'PENDING':
                return <span className={`${styles.statusBadge} ${styles.pending}`}>⏳ Pending Validation</span>;
            default:
                return null;
        }
    };
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.header}>
                <h3>Enter Actual Data</h3>
                {getStatusBadge()}
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    Actual Value <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={getPlaceholder()}
                        className={`${styles.valueInput} ${error ? styles.error : ''}`}
                        step={getStep()}
                        min="0"
                        disabled={isLoading || existingActual?.status === 'APPROVED'}
                    />
                    {kpi?.unit && <span className={styles.unit}>{kpi.unit}</span>}
                </div>
                {error && <span className={styles.errorText}>{error}</span>}
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this entry..."
                    className={styles.textarea}
                    rows={3}
                    disabled={isLoading || existingActual?.status === 'APPROVED'}
                />
            </div>

            {existingActual?.status !== 'APPROVED' && (
                <EvidenceUpload
                    evidence={evidence}
                    onChange={setEvidence}
                    disabled={isLoading}
                />
            )}

            {existingActual?.status === 'REJECTED' && (
                <div className={styles.rejectionInfo}>
                    <div className={styles.rejectionIcon}>⚠️</div>
                    <div className={styles.rejectionContent}>
                        <strong>This entry was rejected.</strong>
                        <p>Please correct the data and resubmit for validation.</p>
                        {existingActual.last_rejection_reason && (
                            <div className={styles.rejectionReason}>
                                Reason: {existingActual.last_rejection_reason}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.actions}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || existingActual?.status === 'APPROVED'}
                >
                    {isLoading ? 'Submitting...' : existingActual ? 'Update Entry' : 'Submit for Validation'}
                </button>
            </div>
        </form>
    );
};
ActualEntryForm.propTypes = {
    kpi: PropTypes.shape({
        kpi_type: PropTypes.string,
        unit: PropTypes.string,
        calculation_logic: PropTypes.string,
    }),
    existingActual: PropTypes.shape({
        actual_value: PropTypes.number,
        notes: PropTypes.string,
        status: PropTypes.string,
        last_rejection_reason: PropTypes.string,
    }),
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default ActualEntryForm;
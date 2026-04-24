import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ValidationWorkflow.module.css';

const RejectionModal = ({ isOpen, onClose, onConfirm, isLoading, reasons }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [comment, setComment] = useState('');
    const handleConfirm = () => {
        if (selectedReason) {
            onConfirm(selectedReason, comment);
            setSelectedReason('');
            setComment('');
        }
    };
    if (!isOpen) return null;
    const defaultReasons = [
        { id: 'data_quality', label: 'Data Quality Issues' },
        { id: 'missing_evidence', label: 'Missing Evidence' },
        { id: 'calculation_error', label: 'Calculation Error' },
        { id: 'timing', label: 'Submitted After Deadline' },
        { id: 'other', label: 'Other' },
    ];
    const reasonList = reasons || defaultReasons;
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h3>Reject Data</h3>
                <p>Please provide a reason for rejection:</p>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Rejection Reason <span className={styles.required}>*</span></label>
                    <select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Select a reason...</option>
                        {reasonList.map(reason => (
                            <option key={reason.id} value={reason.id}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Comment (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide additional feedback to help the user correct the data..."
                        className={styles.escalationReason}
                        rows={4}
                    />
                </div>
                <div className={styles.modalActions}>
                    <button
                        onClick={onClose}
                        className={styles.cancelButton}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={styles.rejectButton}
                        disabled={!selectedReason || isLoading}
                    >
                        {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                </div>
            </div>
        </div>
    );
};
RejectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    reasons: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
    })),
};
export default RejectionModal
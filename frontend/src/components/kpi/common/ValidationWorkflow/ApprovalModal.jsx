import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ValidationWorkflow.module.css';

const ApprovalModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [comment, setComment] = useState('');
    const handleConfirm = () => {
        onConfirm(comment);
        setComment('');
    };
    if (!isOpen) return null;
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h3>Approve Data</h3>
                <p>Are you sure you want to approve this data entry?</p>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Comment (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add any comments about this approval..."
                        className={styles.escalationReason}
                        rows={3}
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
                        className={styles.approveButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Approving...' : 'Confirm Approval'}
                    </button>
                </div>
            </div>
        </div>
    );
};
ApprovalModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default ApprovalModal;
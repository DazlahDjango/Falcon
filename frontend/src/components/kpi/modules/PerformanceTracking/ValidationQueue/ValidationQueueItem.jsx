import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../../../common';
import styles from './ValidationQueueItem.module.css';

const ValidationQueueItem = ({ validation, onApprove, onReject, onEscalate, isProcessing }) => {
    const [showActions, setShowActions] = useState(false);
    const [comment, setComment] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [escalationReason, setEscalationReason] = useState('');
    const daysPending = Math.floor((new Date() - new Date(validation.submitted_at)) / (1000 * 60 * 60 *24));
    const isUrgent = daysPending > 3;
    const getPriorityLabel = () => {
        if (daysPending > 7) return 'Critical';
        if (daysPending > 3) return 'Urgent';
        if (daysPending > 1) return 'Normal'
        return 'New';
    };
    const getPriorityClass = () => {
        if (daysPending > 7) return styles.priorityCritical;
        if (daysPending > 3) return styles.priorityUrgent;
        if (daysPending > 1) return styles.priorityNormal;
        return styles.priorityNew;
    };
    const handleApprove = () => {
        onApprove(validation.id, comment);
        setShowActions(false);
        setComment('');
    };
    const handleReject = () => {
        onReject(validation.id, rejectionReason, comment);
        setShowRejectModal(false);
        setComment('');
        setRejectionReason('');
    };
    const handleEscalate = () => {
        onEscalate(validation.id, escalationReason);
        setShowEscalateModal(false);
        setEscalationReason('');
    };
    return (
        <div className={`${styles.queueItem} ${isUrgent ? styles.urgent : ''}`}>
            <div className={styles.itemHeader}>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{validation.user_name}</span>
                    <span className={styles.userEmail}>{validation.user_email}</span>
                </div>
                <div className={`${styles.priority} ${getPriorityClass()}`}>
                    {getPriorityLabel()}
                </div>
            </div>

            <div className={styles.itemContent}>
                <div className={styles.kpiInfo}>
                    <span className={styles.kpiName}>{validation.kpi_name}</span>
                    <span className={styles.kpiCode}>{validation.kpi_code}</span>
                </div>
                <div className={styles.actualValue}>
                    <span className={styles.valueLabel}>Actual:</span>
                    <span className={styles.value}>{validation.actual_value} {validation.unit}</span>
                </div>
                <div className={styles.submittedInfo}>
                    <span>Submitted: {new Date(validation.submitted_at).toLocaleDateString()}</span>
                    <span className={styles.daysPending}>{daysPending} days ago</span>
                </div>
                {validation.notes && (
                    <div className={styles.notes}>
                        <span className={styles.notesLabel}>Notes:</span>
                        <span>{validation.notes}</span>
                    </div>
                )}
                {validation.evidence?.length > 0 && (
                    <div className={styles.evidence}>
                        <span className={styles.evidenceLabel}>Evidence:</span>
                        <div className={styles.evidenceList}>
                            {validation.evidence.map((file, idx) => (
                                <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className={styles.evidenceLink}>
                                    📎 {file.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.itemActions}>
                <button
                    onClick={() => setShowActions(!showActions)}
                    className={styles.reviewButton}
                    disabled={isProcessing}
                >
                    {showActions ? 'Cancel' : 'Review'}
                </button>
            </div>

            {showActions && (
                <div className={styles.actionPanel}>
                    <textarea
                        placeholder="Add comment (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={styles.commentInput}
                        rows={2}
                    />
                    <div className={styles.actionButtons}>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className={styles.rejectButton}
                            disabled={isProcessing}
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => setShowEscalateModal(true)}
                            className={styles.escalateButton}
                            disabled={isProcessing}
                        >
                            Escalate
                        </button>
                        <button
                            onClick={handleApprove}
                            className={styles.approveButton}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Approve'}
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className={styles.modal} onClick={() => setShowRejectModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h4>Reject Entry</h4>
                        <p>Please select a reason for rejection:</p>
                        <select
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className={styles.rejectSelect}
                        >
                            <option value="">Select a reason...</option>
                            <option value="data_quality">Data Quality Issues</option>
                            <option value="missing_evidence">Missing Evidence</option>
                            <option value="calculation_error">Calculation Error</option>
                            <option value="timing">Submitted After Deadline</option>
                            <option value="other">Other</option>
                        </select>
                        <textarea
                            placeholder="Additional comments..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className={styles.commentInput}
                            rows={3}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowRejectModal(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button onClick={handleReject} className={styles.rejectButton} disabled={!rejectionReason}>
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalate Modal */}
            {showEscalateModal && (
                <div className={styles.modal} onClick={() => setShowEscalateModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h4>Escalate for Review</h4>
                        <p>Please provide reason for escalation:</p>
                        <textarea
                            placeholder="Explain why this requires escalation..."
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            className={styles.commentInput}
                            rows={4}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowEscalateModal(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button onClick={handleEscalate} className={styles.escalateButton} disabled={!escalationReason}>
                                Escalate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
ValidationQueueItem.propTypes = {
    validation: PropTypes.shape({
        id: PropTypes.string,
        user_name: PropTypes.string,
        user_email: PropTypes.string,
        kpi_name: PropTypes.string,
        kpi_code: PropTypes.string,
        actual_value: PropTypes.number,
        unit: PropTypes.string,
        submitted_at: PropTypes.string,
        notes: PropTypes.string,
        evidence: PropTypes.array,
    }).isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    onEscalate: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool,
};
export default ValidationQueueItem;
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ApprovalModal from './ApprovalModal';
import RejectionModal from './RejectionModal';
import styles from './ValidationWorkflow.module.css';

const ValidationWorkflow = ({ 
    actual, 
    onApprove, 
    onReject, 
    onEscalate,
    isLoading 
}) => {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [escalationReason, setEscalationReason] = useState('');
    const getStatusBadge = () => {
        switch (actual?.status) {
            case 'PENDING':
                return <span className={`${styles.badge} ${styles.pending}`}>Pending</span>;
            case 'APPROVED':
                return <span className={`${styles.badge} ${styles.approved}`}>Approved</span>;
            case 'REJECTED':
                return <span className={`${styles.badge} ${styles.rejected}`}>Rejected</span>;
            default:
                return null;
        }
    };
    const handleEscalate = () => {
        if (escalationReason.trim()) {
            onEscalate(escalationReason);
            setShowEscalateModal(false);
            setEscalationReason('');
        }
    };
    if (!actual) return null;
    return (
        <div className={styles.validationWorkflow}>
            <div className={styles.header}>
                <h3>Validation Workflow</h3>
                {getStatusBadge()}
            </div>

            <div className={styles.content}>
                <div className={styles.actualInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>KPI:</span>
                        <span className={styles.value}>{actual.kpiName}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>User:</span>
                        <span className={styles.value}>{actual.userName}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Period:</span>
                        <span className={styles.value}>{actual.period}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Value:</span>
                        <span className={styles.value}>{actual.actualValue} {actual.unit}</span>
                    </div>
                    {actual.notes && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Notes:</span>
                            <span className={styles.value}>{actual.notes}</span>
                        </div>
                    )}
                </div>

                {actual.evidence?.length > 0 && (
                    <div className={styles.evidenceSection}>
                        <h4>Evidence</h4>
                        <div className={styles.evidenceList}>
                            {actual.evidence.map((item, idx) => (
                                <a 
                                    key={idx} 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.evidenceLink}
                                >
                                    📎 {item.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {actual.status === 'PENDING' && (
                    <div className={styles.actions}>
                        <button
                            onClick={() => setShowApprovalModal(true)}
                            className={styles.approveButton}
                            disabled={isLoading}
                        >
                            ✓ Approve
                        </button>
                        <button
                            onClick={() => setShowRejectionModal(true)}
                            className={styles.rejectButton}
                            disabled={isLoading}
                        >
                            ✗ Reject
                        </button>
                        <button
                            onClick={() => setShowEscalateModal(true)}
                            className={styles.escalateButton}
                            disabled={isLoading}
                        >
                            ⚠ Escalate
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ApprovalModal
                isOpen={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                onConfirm={onApprove}
                isLoading={isLoading}
            />

            <RejectionModal
                isOpen={showRejectionModal}
                onClose={() => setShowRejectionModal(false)}
                onConfirm={onReject}
                isLoading={isLoading}
            />

            {showEscalateModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Escalate for Review</h3>
                        <p>Please provide a reason for escalation:</p>
                        <textarea
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            placeholder="Explain why this requires escalation..."
                            className={styles.escalationReason}
                            rows={4}
                        />
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowEscalateModal(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalate}
                                className={styles.escalateConfirmButton}
                                disabled={!escalationReason.trim()}
                            >
                                Escalate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
ValidationWorkflow.propTypes = {
    actual: PropTypes.shape({
        id: PropTypes.string,
        kpiName: PropTypes.string,
        userName: PropTypes.string,
        period: PropTypes.string,
        actualValue: PropTypes.number,
        unit: PropTypes.string,
        notes: PropTypes.string,
        status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']),
        evidence: PropTypes.array,
    }),
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    onEscalate: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default ValidationWorkflow;
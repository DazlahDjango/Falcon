import React, { useState } from 'react';
import { FiArrowLeft, FiEdit, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import ActualInfo from './ActualInfo';
import ActualEvidence from './ActualEvidence';
import ActualValidations from './ActualValidations';
import KPILoading from '../../common/KPILoading';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';
import EscalationPanel from '../../validations/EscalationPanel';

const ActualDetail = ({ 
    actual, 
    loading, 
    onBack, 
    onValidate,
    onResubmit,
    canValidate,
    canResubmit
}) => {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showResubmitModal, setShowResubmitModal] = useState(false);
    const [showEscalate, setShowEscalate] = useState(false);

    if (loading) {
        return <KPILoading text="Loading actual details..." />;
    }

    if (!actual) {
        return null;
    }

    const isPending = actual.status === 'PENDING';
    const isRejected = actual.status === 'REJECTED';

    return (
        <div className="kpi-actual-detail">
            <div className="kpi-actual-detail-header">
                <button className="kpi-actual-detail-back" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to List
                </button>
                <div className="kpi-actual-detail-actions">
                    {canValidate && isPending && (
                        <>
                            <button 
                                className="kpi-actual-detail-approve"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <FiCheckCircle size={14} />
                                Approve
                            </button>
                            <button 
                                className="kpi-actual-detail-reject"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <FiXCircle size={14} />
                                Reject
                            </button>
                            <button 
                                className="kpi-actual-detail-escalate"
                                onClick={() => setShowEscalate(true)}
                            >
                                <FiAlertTriangle size={14} />
                                Escalate
                            </button>
                        </>
                    )}
                    {canResubmit && isRejected && (
                        <button 
                            className="kpi-actual-detail-resubmit"
                            onClick={() => setShowResubmitModal(true)}
                        >
                            <FiEdit size={14} />
                            Resubmit
                        </button>
                    )}
                </div>
            </div>
            
            <div className="kpi-actual-detail-content">
                <ActualInfo actual={actual} />
                <ActualEvidence evidence={actual.evidence || []} />
                <ActualValidations validations={actual.validations || []} />
                
                {showEscalate && (
                    <EscalationPanel 
                        actualId={actual.id}
                        onClose={() => setShowEscalate(false)}
                        onEscalate={onValidate}
                    />
                )}
            </div>
            
            <KPIConfirmDialog
                isOpen={showApproveModal}
                title="Approve Submission"
                message={`Are you sure you want to approve this submission?`}
                confirmText="Approve"
                type="success"
                onConfirm={() => {
                    onValidate('approve', actual.id);
                    setShowApproveModal(false);
                }}
                onCancel={() => setShowApproveModal(false)}
            />
            
            <KPIConfirmDialog
                isOpen={showRejectModal}
                title="Reject Submission"
                message="Are you sure you want to reject this submission?"
                confirmText="Reject"
                type="danger"
                onConfirm={() => {
                    onValidate('reject', actual.id);
                    setShowRejectModal(false);
                }}
                onCancel={() => setShowRejectModal(false)}
            />
            
            <KPIConfirmDialog
                isOpen={showResubmitModal}
                title="Resubmit"
                message="This will allow the user to submit a new value for this period."
                confirmText="Allow Resubmit"
                type="warning"
                onConfirm={() => {
                    onResubmit?.(actual.id);
                    setShowResubmitModal(false);
                }}
                onCancel={() => setShowResubmitModal(false)}
            />
        </div>
    );
};

export default ActualDetail;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import ActualInfo from './ActualInfo';
import ActualEvidence from './ActualEvidence';
import ActualValidations from './ActualValidations';
import KPILoading from '../../common/KPILoading';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';
import EscalationFormModal from '../../validations/EscalationFormModal';
import ValidationModal from '../../validations/ValidationModal';
import { 
    fetchActual, 
    approveActual, 
    rejectActual, 
    selectCurrentActual, 
    selectActualLoading,
    selectActuals
} from '../../../../store/kpi';
import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';
import useEscalations from '../../../../hooks/kpi/useEscalations';

const ActualDetail = ({ 
    actual: propActual,
    actualId, 
    loading: propLoading, 
    onBack, 
    onValidate: propOnValidate,
    onResubmit,
    canValidate: propCanValidate,
    canResubmit
}) => {
    const dispatch = useDispatch();
    const { user, canValidateActuals, canManageKPIs, isManager, isExecutive } = useKPIPermissions();
    const { escalate } = useEscalations();

    const reduxCurrentActual = useSelector(selectCurrentActual);
    const reduxActuals = useSelector(selectActuals) || [];
    const reduxLoading = useSelector(selectActualLoading);

    const actual = propActual || reduxCurrentActual || (actualId ? reduxActuals.find(a => a.id === actualId) : null);
    const loading = propLoading || (actualId && !actual && reduxLoading);

    const isOwnSubmission = Boolean(actual && user && (
        String(actual.user_id) === String(user.id) ||
        String(actual.user?.id) === String(user.id) ||
        (actual.user?.email && user.email && actual.user.email.toLowerCase() === user.email.toLowerCase()) ||
        (actual.user_email && user.email && actual.user_email.toLowerCase() === user.email.toLowerCase())
    ));

    const canValidate = (propCanValidate || canValidateActuals || canManageKPIs || isManager || isExecutive) && !isOwnSubmission;

    useEffect(() => {
        if (actualId && (!actual || actual.id !== actualId)) {
            dispatch(fetchActual(actualId));
        }
    }, [dispatch, actualId]);

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showResubmitModal, setShowResubmitModal] = useState(false);
    const [showEscalate, setShowEscalate] = useState(false);
    const [escalating, setEscalating] = useState(false);

    const handleApprove = async () => {
        const targetId = actual?.id || actualId;
        if (propOnValidate) {
            await propOnValidate('approve', targetId);
        } else {
            await dispatch(approveActual({ id: targetId })).unwrap();
            dispatch(fetchActual(targetId));
        }
        setShowApproveModal(false);
    };

    const handleReject = async (payload = {}) => {
        const targetId = actual?.id || actualId;
        const reasonId = payload?.reasonId || null;
        const comment = payload?.comment || '';
        if (propOnValidate) {
            await propOnValidate('reject', targetId, reasonId, comment);
        } else {
            await dispatch(rejectActual({ id: targetId, reasonId, comment })).unwrap();
            dispatch(fetchActual(targetId));
        }
        setShowRejectModal(false);
    };

    const handleEscalateSubmit = async (payload) => {
        setEscalating(true);
        try {
            await escalate(payload.actual_id, payload.escalated_to_id, payload.reason);
            setShowEscalate(false);
            dispatch(fetchActual(payload.actual_id));
            alert('KPI Result Escalation successfully submitted!');
        } catch (err) {
            console.error('Failed to submit escalation:', err);
            alert(err?.response?.data?.error || err?.message || 'Failed to submit escalation');
        } finally {
            setEscalating(false);
        }
    };

    if (loading) {
        return <KPILoading text="Loading actual details..." />;
    }

    if (!actual) {
        return (
            <div className="kpi-actual-detail" style={{ padding: '2rem', textAlign: 'center' }}>
                <button className="kpi-actual-detail-back" onClick={onBack} style={{ marginBottom: '1rem' }}>
                    <FiArrowLeft size={16} /> Back to List
                </button>
                <p style={{ color: '#64748b' }}>Actual submission not found or failed to load.</p>
            </div>
        );
    }

    const isPending = actual.status === 'PENDING';
    const isRejected = actual.status === 'REJECTED';
    const isEscalated = actual.status === 'ESCALATED';

    return (
        <div className="kpi-actual-detail">
            <div className="kpi-actual-detail-header">
                <button className="kpi-actual-detail-back" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to List
                </button>
                <div className="kpi-actual-detail-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {(isPending || isEscalated) && canValidate && (
                        <>
                            <button 
                                className="kpi-actual-detail-approve"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <FiCheckCircle size={14} />
                                Approve
                            </button>
                            {isPending && (
                                <button 
                                    className="kpi-actual-detail-reject"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <FiXCircle size={14} />
                                    Reject
                                </button>
                            )}
                        </>
                    )}
                    {(isPending || isRejected) && (
                        <button 
                            className="kpi-actual-detail-escalate"
                            onClick={() => setShowEscalate(true)}
                            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                        >
                            <FiAlertTriangle size={14} />
                            Escalate Result
                        </button>
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

            {isEscalated && (
                <div style={{ background: '#f3e8ff', border: '1px solid #c084fc', color: '#6b21a8', padding: '0.85rem 1.1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FiAlertTriangle size={18} color="#9333ea" />
                    <div>
                        <strong>ESCALATED:</strong> This performance result is currently under review by management reporting hierarchy. It will remain in Escalated status until solved or approved.
                    </div>
                </div>
            )}
            
            <div className="kpi-actual-detail-content">
                <ActualInfo actual={actual} />
                <ActualEvidence evidence={actual.evidence || []} />
                <ActualValidations validations={actual.validations || []} />
                
                {showEscalate && (
                    <EscalationFormModal 
                        actual={actual}
                        onClose={() => setShowEscalate(false)}
                        onSubmit={handleEscalateSubmit}
                        loading={escalating}
                    />
                )}
            </div>
            
            <KPIConfirmDialog
                isOpen={showApproveModal}
                title="Approve Submission"
                message={`Are you sure you want to approve this submission?`}
                confirmText="Approve"
                type="success"
                onConfirm={handleApprove}
                onCancel={() => setShowApproveModal(false)}
            />
            
            <ValidationModal
                isOpen={showRejectModal}
                type="reject"
                validation={actual}
                onConfirm={handleReject}
                onClose={() => setShowRejectModal(false)}
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
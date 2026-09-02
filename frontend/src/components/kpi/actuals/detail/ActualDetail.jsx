import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import ActualInfo from './ActualInfo';
import ActualEvidence from './ActualEvidence';
import ActualValidations from './ActualValidations';
import KPILoading from '../../common/KPILoading';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';
import EscalationPanel from '../../validations/EscalationPanel';
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
    const { canValidateActuals, canManageKPIs, isManager, isExecutive } = useKPIPermissions();
    const canValidate = propCanValidate || canValidateActuals || canManageKPIs || isManager || isExecutive;

    const reduxCurrentActual = useSelector(selectCurrentActual);
    const reduxActuals = useSelector(selectActuals) || [];
    const reduxLoading = useSelector(selectActualLoading);

    const actual = propActual || reduxCurrentActual || (actualId ? reduxActuals.find(a => a.id === actualId) : null);
    const loading = propLoading || (actualId && !actual && reduxLoading);

    useEffect(() => {
        if (actualId && (!actual || actual.id !== actualId)) {
            dispatch(fetchActual(actualId));
        }
    }, [dispatch, actualId]);

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showResubmitModal, setShowResubmitModal] = useState(false);
    const [showEscalate, setShowEscalate] = useState(false);

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
                        onEscalate={propOnValidate}
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
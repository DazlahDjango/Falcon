import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import KPIInfo from './KPIInfo';
import KPIStats from './KPIStats';
import KPITargets from './KPITargets';
import KPIScores from './KPIScores';
import KPIWeights from './KPIWeights';
import KPIDependencies from './KPIDependencies';
import KPIValidation from './KPIValidation';
import KPIHistory from './KPIHistory';
import KPICascadeHierarchy from './KPICascadeHierarchy';
import KPILoading from '../../common/KPILoading';
import KPIError from '../../common/KPIError';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';
import { 
    fetchKPI, 
    activateKPI, 
    deactivateKPI, 
    approveKPI,
    clearCurrentKPI,
    selectCurrentKPI,
    selectKPILoadingDetails,
    selectKPIError
} from '../../../../store/kpi';
import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';

const KPIDetail = ({ kpiId, onBack, onEdit }) => {
    const dispatch = useDispatch();
    const { user, canManageKPIs, canApproveKPI, isManager, isExecutive, isClientAdmin, isSuperAdmin, isDashboardChampion } = useKPIPermissions();
    const canSeeAdminTabs = canManageKPIs || isManager || isExecutive || isClientAdmin || isSuperAdmin || isDashboardChampion;
    const canManageOrApprove = canManageKPIs || canApproveKPI || isManager;

    const [activeTab, setActiveTab] = useState('info');
    const [showActivateConfirm, setShowActivateConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    
    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);
    const error = useSelector(selectKPIError);

    const isOwnerOrCreator = kpi && user && (
        String(kpi.owner_id) === String(user.id) ||
        String(kpi.created_by_id) === String(user.id) ||
        String(kpi.owner) === String(user.id) ||
        (kpi.owner_email && user.email && kpi.owner_email.toLowerCase() === user.email.toLowerCase()) ||
        (kpi.user_email && user.email && kpi.user_email.toLowerCase() === user.email.toLowerCase())
    );
    const isPendingOrInactive = kpi && (kpi.approval_status === 'PENDING_APPROVAL' || kpi.approval_status === 'PENDING' || !kpi.is_active);
    const canEditThisKPI = canManageKPIs || (isOwnerOrCreator && isPendingOrInactive);
    
    useEffect(() => {
        if (kpiId) {
            dispatch(fetchKPI(kpiId));
        }
        return () => {
            dispatch(clearCurrentKPI());
        };
    }, [dispatch, kpiId]);
    
    const handleActivate = async () => {
        await dispatch(activateKPI(kpiId)).unwrap();
        setShowActivateConfirm(false);
        dispatch(fetchKPI(kpiId));
    };
    
    const handleDeactivate = async (targetStatus = 'INACTIVE') => {
        await dispatch(deactivateKPI({ id: kpiId, reason: 'Manual deactivation', target_status: targetStatus })).unwrap();
        setShowDeactivateConfirm(false);
        dispatch(fetchKPI(kpiId));
    };

    const handleApproveKPI = async () => {
        await dispatch(approveKPI(kpiId)).unwrap();
        dispatch(fetchKPI(kpiId));
    };

    const allTabs = [
        { id: 'info', label: 'Information' },
        { id: 'stats', label: 'Statistics' },
        { id: 'targets', label: 'Targets' },
        { id: 'scores', label: 'Scores' },
        { id: 'weights', label: 'Weights' },
        { id: 'dependencies', label: 'Dependencies', adminOnly: true },
        { id: 'validation', label: 'Validation', adminOnly: true },
        { id: 'history', label: 'History' },
        { id: 'hierarchy', label: 'Cascade Hierarchy', adminOnly: true }
    ];

    const tabs = allTabs.filter(tab => !tab.adminOnly || canSeeAdminTabs);
    
    if (loading) {
        return <KPILoading text="Loading Performance Indicator details..." />;
    }
    
    if (error || !kpi) {
        const errorMessage = typeof error === 'string' 
            ? error 
            : (error?.message || error?.detail || (!kpi ? "Performance Indicator not found or does not exist." : "An error occurred while loading Performance Indicator details."));
        return <KPIError message={errorMessage} onRetry={() => dispatch(fetchKPI(kpiId))} />;
    }
    
    return (
        <div className="kpi-detail-container">
            <div className="kpi-detail-header">
                <button className="kpi-detail-back" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to List
                </button>
                <div className="kpi-detail-actions">
                    {kpi.approval_status === 'PENDING_APPROVAL' && canManageOrApprove && (
                        <button 
                            className="kpi-detail-activate"
                            style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            onClick={handleApproveKPI}
                        >
                            <FiCheckCircle size={14} />
                            Approve KPI
                        </button>
                    )}
                    {canManageOrApprove && (
                        <>
                            {kpi.is_active ? (
                                <button 
                                    className="kpi-detail-deactivate"
                                    onClick={() => setShowDeactivateConfirm(true)}
                                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <FiXCircle size={14} />
                                    Deactivate / Inactivate
                                </button>
                            ) : (
                                <button 
                                    className="kpi-detail-activate"
                                    onClick={() => setShowActivateConfirm(true)}
                                >
                                    <FiCheckCircle size={14} />
                                    Activate
                                </button>
                            )}
                        </>
                    )}
                    {canEditThisKPI && (
                        <button className="kpi-detail-edit" onClick={() => onEdit && onEdit(kpiId)}>
                            <FiEdit size={14} />
                            Edit
                        </button>
                    )}
                    <button className="kpi-detail-refresh" onClick={() => dispatch(fetchKPI(kpiId))}>
                        <FiRefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>
            
            <div className="kpi-detail-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`kpi-detail-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="kpi-detail-content">
                {activeTab === 'info' && <KPIInfo kpi={kpi} />}
                {activeTab === 'stats' && <KPIStats kpi={kpi} />}
                {activeTab === 'targets' && <KPITargets kpiId={kpiId} kpi={kpi} />}
                {activeTab === 'scores' && <KPIScores kpiId={kpiId} kpi={kpi} />}
                {activeTab === 'weights' && <KPIWeights kpiId={kpiId} kpi={kpi} />}
                {activeTab === 'dependencies' && <KPIDependencies kpiId={kpiId} />}
                {activeTab === 'validation' && <KPIValidation kpiId={kpiId} />}
                {activeTab === 'history' && <KPIHistory kpiId={kpiId} />}
                {activeTab === 'hierarchy' && <KPICascadeHierarchy kpiId={kpiId} kpi={kpi} />}
            </div>
            
            <KPIConfirmDialog
                isOpen={showActivateConfirm}
                title="Activate Performance Indicator"
                message={`Are you sure you want to activate "${kpi.name}"? This will make it visible in dashboards and calculations.`}
                confirmText="Activate"
                type="success"
                onConfirm={handleActivate}
                onCancel={() => setShowActivateConfirm(false)}
            />
            
            {showDeactivateConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
                            Deactivate KPI Status
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 1.25rem' }}>
                            Choose how to deactivate <strong>"{kpi.name}"</strong>:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <button
                                type="button"
                                onClick={() => handleDeactivate('INACTIVE')}
                                style={{
                                    padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1',
                                    backgroundColor: '#f8fafc', color: '#334155', textAlign: 'left', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.875rem'
                                }}
                            >
                                <div style={{ color: '#0f172a' }}>Set Status to Inactive</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                                    Deactivates the KPI while keeping it marked as approved previously.
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeactivate('PENDING_APPROVAL')}
                                style={{
                                    padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #fde68a',
                                    backgroundColor: '#fffbeb', color: '#b45309', textAlign: 'left', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.875rem'
                                }}
                            >
                                <div style={{ color: '#92400e' }}>Revert Status to Pending Approval</div>
                                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 400, marginTop: '2px' }}>
                                    Deactivates and returns the KPI to the lead approval queue (if activated accidentally).
                                </div>
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowDeactivateConfirm(false)}
                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIDetail;
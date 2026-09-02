import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import KPIInfo from './KPIInfo';
import KPIStats from './KPIStats';
import KPITargets from './KPITargets';
import KPIScores from './KPIScores';
import KPIWeights from './KPIWeights';
import KPIDependencies from './KPIDependencies';
import KPIStrategicLinkages from './KPIStrategicLinkages';
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
    const { canManageKPIs, canApproveKPI, isManager, isExecutive, isClientAdmin, isSuperAdmin, isDashboardChampion } = useKPIPermissions();
    const canSeeAdminTabs = canManageKPIs || isManager || isExecutive || isClientAdmin || isSuperAdmin || isDashboardChampion;
    const canManageOrApprove = canManageKPIs || canApproveKPI || isManager;

    const [activeTab, setActiveTab] = useState('info');
    const [showActivateConfirm, setShowActivateConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    
    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);
    const error = useSelector(selectKPIError);
    
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
    
    const handleDeactivate = async () => {
        await dispatch(deactivateKPI({ id: kpiId, reason: 'Manual deactivation' })).unwrap();
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
        { id: 'linkages', label: 'Strategic Linkages', adminOnly: true },
        { id: 'validation', label: 'Validation', adminOnly: true },
        { id: 'history', label: 'History' },
        { id: 'hierarchy', label: 'Cascade Hierarchy', adminOnly: true }
    ];

    const tabs = allTabs.filter(tab => !tab.adminOnly || canSeeAdminTabs);
    
    if (loading) {
        return <KPILoading text="Loading KPI details..." />;
    }
    
    if (error || !kpi) {
        const errorMessage = typeof error === 'string' 
            ? error 
            : (error?.message || error?.detail || (!kpi ? "KPI not found or does not exist." : "An error occurred while loading KPI details."));
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
                            style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none' }}
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
                                >
                                    <FiXCircle size={14} />
                                    Deactivate
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
                            <button className="kpi-detail-edit" onClick={() => onEdit && onEdit(kpiId)}>
                                <FiEdit size={14} />
                                Edit
                            </button>
                        </>
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
                {activeTab === 'linkages' && <KPIStrategicLinkages kpiId={kpiId} />}
                {activeTab === 'validation' && <KPIValidation kpiId={kpiId} />}
                {activeTab === 'history' && <KPIHistory kpiId={kpiId} />}
                {activeTab === 'hierarchy' && <KPICascadeHierarchy kpiId={kpiId} kpi={kpi} />}
            </div>
            
            <KPIConfirmDialog
                isOpen={showActivateConfirm}
                title="Activate KPI"
                message={`Are you sure you want to activate "${kpi.name}"? This will make it visible in dashboards and calculations.`}
                confirmText="Activate"
                type="success"
                onConfirm={handleActivate}
                onCancel={() => setShowActivateConfirm(false)}
            />
            
            <KPIConfirmDialog
                isOpen={showDeactivateConfirm}
                title="Deactivate KPI"
                message={`Are you sure you want to deactivate "${kpi.name}"? Deactivated KPIs won't appear in dashboards.`}
                confirmText="Deactivate"
                type="danger"
                onConfirm={handleDeactivate}
                onCancel={() => setShowDeactivateConfirm(false)}
            />
        </div>
    );
};

export default KPIDetail;
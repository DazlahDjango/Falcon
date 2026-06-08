import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { activateKPI, deactivateKPI } from '../../../../store/kpi';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIActivateDeactivate = ({ kpi, onComplete }) => {
    const dispatch = useDispatch();
    const [showActivateConfirm, setShowActivateConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleActivate = async () => {
        setLoading(true);
        await dispatch(activateKPI(kpi.id)).unwrap();
        setLoading(false);
        setShowActivateConfirm(false);
        onComplete?.();
    };
    
    const handleDeactivate = async () => {
        setLoading(true);
        await dispatch(deactivateKPI({ id: kpi.id, reason: 'Manual deactivation' })).unwrap();
        setLoading(false);
        setShowDeactivateConfirm(false);
        onComplete?.();
    };
    
    const isActive = kpi?.is_active;
    
    return (
        <div className="kpi-actions-panel">
            <div className="actions-header">
                <h3>KPI Actions</h3>
                <p>Manage the status and lifecycle of this KPI</p>
            </div>
            
            <div className="actions-section">
                <div className="action-card">
                    <div className="action-icon">
                        {isActive ? <FiCheckCircle size={24} color="var(--kpi-success)" /> : <FiXCircle size={24} color="var(--kpi-danger)" />}
                    </div>
                    <div className="action-info">
                        <div className="action-title">
                            Current Status: {isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="action-description">
                            {isActive 
                                ? 'This KPI is currently active and visible in dashboards and calculations.'
                                : 'This KPI is currently inactive and hidden from dashboards.'}
                        </div>
                    </div>
                </div>
                
                {isActive ? (
                    <button 
                        className="action-btn deactivate"
                        onClick={() => setShowDeactivateConfirm(true)}
                        disabled={loading}
                    >
                        <FiXCircle size={14} />
                        Deactivate KPI
                    </button>
                ) : (
                    <button 
                        className="action-btn activate"
                        onClick={() => setShowActivateConfirm(true)}
                        disabled={loading}
                    >
                        <FiCheckCircle size={14} />
                        Activate KPI
                    </button>
                )}
            </div>
            
            <div className="warning-section">
                <FiAlertTriangle size={16} />
                <div className="warning-text">
                    <strong>Note:</strong> Deactivating a KPI will hide it from dashboards and exclude it from calculations. 
                    Historical data will be preserved.
                </div>
            </div>
            
            <KPIConfirmDialog
                isOpen={showActivateConfirm}
                title="Activate KPI"
                message={`Are you sure you want to activate "${kpi?.name}"? This will make it visible in dashboards and calculations.`}
                confirmText="Activate"
                type="success"
                onConfirm={handleActivate}
                onCancel={() => setShowActivateConfirm(false)}
            />
            
            <KPIConfirmDialog
                isOpen={showDeactivateConfirm}
                title="Deactivate KPI"
                message={`Are you sure you want to deactivate "${kpi?.name}"? Deactivated KPIs won't appear in dashboards.`}
                confirmText="Deactivate"
                type="danger"
                onConfirm={handleDeactivate}
                onCancel={() => setShowDeactivateConfirm(false)}
            />
        </div>
    );
};

export default KPIActivateDeactivate;
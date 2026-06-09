import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import { activateKPI, deactivateKPI } from '../../../../store/kpi';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIActivateDeactivate = ({ kpi, onComplete }) => {
    const dispatch = useDispatch();
    const [showActivateConfirm, setShowActivateConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleActivate = async () => {
        setError(null);
        setLoading(true);
        try {
            await dispatch(activateKPI(kpi.id)).unwrap();
            setShowActivateConfirm(false);
            onComplete?.();
        } catch (err) {
            console.error('Failed to activate KPI:', err);
            setError(err?.message || 'Failed to activate KPI. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeactivate = async () => {
        setError(null);
        setLoading(true);
        try {
            await dispatch(deactivateKPI({ id: kpi.id, reason: 'Manual deactivation' })).unwrap();
            setShowDeactivateConfirm(false);
            onComplete?.();
        } catch (err) {
            console.error('Failed to deactivate KPI:', err);
            setError(err?.message || 'Failed to deactivate KPI. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const isActive = kpi?.is_active;
    
    return (
        <div className="kpi-actions-panel">
            {error && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{error}</span>
                        <button 
                            className="close-btn" 
                            onClick={() => setError(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
            )}
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
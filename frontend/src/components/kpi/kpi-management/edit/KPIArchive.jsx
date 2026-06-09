import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiArchive, FiAlertTriangle, FiX } from 'react-icons/fi';
import { deactivateKPI } from '../../../../store/kpi';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIArchive = ({ kpi, onComplete }) => {
    const dispatch = useDispatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleArchive = async () => {
        setError(null);
        setLoading(true);
        try {
            await dispatch(deactivateKPI({ id: kpi.id, reason: 'Archived' })).unwrap();
            setShowConfirm(false);
            onComplete?.();
        } catch (err) {
            console.error('Failed to archive KPI:', err);
            setError(err?.message || 'Failed to archive KPI. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="kpi-archive-panel">
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
            <div className="archive-header">
                <FiArchive size={24} color="var(--kpi-warning)" />
                <h3>Archive KPI</h3>
            </div>
            
            <div className="archive-content">
                <p>Archive this KPI to remove it from active use while preserving historical data.</p>
                <div className="warning-box">
                    <FiAlertTriangle size={16} />
                    <span>Archived KPIs cannot be used in new targets or calculations.</span>
                </div>
            </div>
            
            <button 
                className="archive-btn"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
            >
                <FiArchive size={14} />
                Archive KPI
            </button>
            
            <KPIConfirmDialog
                isOpen={showConfirm}
                title="Archive KPI"
                message={`Are you sure you want to archive "${kpi?.name}"? This action can be reversed by reactivating the KPI.`}
                confirmText="Archive"
                type="warning"
                onConfirm={handleArchive}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
};

export default KPIArchive;
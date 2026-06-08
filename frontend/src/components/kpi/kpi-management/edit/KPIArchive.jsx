import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiArchive, FiAlertTriangle } from 'react-icons/fi';
import { deactivateKPI } from '../../../../store/kpi';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIArchive = ({ kpi, onComplete }) => {
    const dispatch = useDispatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleArchive = async () => {
        setLoading(true);
        await dispatch(deactivateKPI({ id: kpi.id, reason: 'Archived' })).unwrap();
        setLoading(false);
        setShowConfirm(false);
        onComplete?.();
    };
    
    return (
        <div className="kpi-archive-panel">
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
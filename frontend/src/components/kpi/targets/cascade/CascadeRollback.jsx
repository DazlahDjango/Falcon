import React, { useState } from 'react';
import { FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';

const CascadeRollback = ({ cascadeMap, orgTargetId, isOrgRollback = false, onRollback, onRollbackOrg, onClose, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleRollback = () => {
        if (confirmText !== 'ROLLBACK') {
            setError('Please type "ROLLBACK" to confirm');
            return;
        }
        if (isOrgRollback && onRollbackOrg) {
            onRollbackOrg(orgTargetId || cascadeMap?.organization_target);
        } else if (onRollback) {
            onRollback();
        }
    };

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="kpi-cascade-rollback-modal">
            <div className="kpi-cascade-rollback-container">
                <div className="kpi-cascade-rollback-header">
                    <FiRotateCcw size={24} color="var(--kpi-danger, #ef4444)" />
                    <h3>{isOrgRollback ? 'Rollback Entire Organization Cascade' : 'Rollback Cascade Map'}</h3>
                </div>
                
                <div className="kpi-cascade-rollback-body">
                    <div className="kpi-cascade-rollback-warning">
                        <FiAlertTriangle size={20} />
                        <p>This will <strong>{isOrgRollback ? 'delete all sub-targets under this organization target' : 'remove this cascaded target'}</strong> and restore original parent state.</p>
                    </div>
                    
                    <div className="kpi-cascade-rollback-info">
                        {cascadeMap?.kpi_name && <p><strong>KPI:</strong> {cascadeMap.kpi_name}</p>}
                        {(cascadeMap?.organization_target_value || orgTargetId) && (
                            <p><strong>Organization Target ID/Value:</strong> {cascadeMap?.organization_target_value || orgTargetId}</p>
                        )}
                        {cascadeMap?.department_target_value && (
                            <p><strong>Department Target:</strong> {cascadeMap?.department_target_value}</p>
                        )}
                        {cascadeMap?.individual_target_value && (
                            <p><strong>Individual Target:</strong> {cascadeMap?.individual_target_value}</p>
                        )}
                    </div>
                    
                    <div className="kpi-cascade-rollback-confirm">
                        <label>Type <strong>ROLLBACK</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type ROLLBACK here"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-cascade-rollback-footer">
                    <button className="cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button 
                        className="rollback"
                        onClick={handleRollback}
                        disabled={loading}
                    >
                        <FiRotateCcw size={14} />
                        {loading ? 'Rolling back...' : (isOrgRollback ? 'Confirm Org Rollback' : 'Confirm Rollback')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CascadeRollback;
import React, { useState } from 'react';
import { FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';

const CascadeRollback = ({ cascadeMap, onRollback, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleRollback = () => {
        if (confirmText !== 'ROLLBACK') {
            setError('Please type "ROLLBACK" to confirm');
            return;
        }
        onRollback();
    };

    return (
        <div className="kpi-cascade-rollback-modal">
            <div className="kpi-cascade-rollback-container">
                <div className="kpi-cascade-rollback-header">
                    <FiRotateCcw size={24} color="var(--kpi-danger)" />
                    <h3>Rollback Cascade</h3>
                </div>
                
                <div className="kpi-cascade-rollback-body">
                    <div className="kpi-cascade-rollback-warning">
                        <FiAlertTriangle size={20} />
                        <p>This will <strong>remove all cascaded targets</strong> and restore original values.</p>
                    </div>
                    
                    <div className="kpi-cascade-rollback-info">
                        <p><strong>KPI:</strong> {cascadeMap?.kpi_name}</p>
                        <p><strong>Organization Target:</strong> {cascadeMap?.organization_target_value}</p>
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
                    <button className="cancel" onClick={() => window.location.reload()}>
                        Cancel
                    </button>
                    <button 
                        className="rollback"
                        onClick={handleRollback}
                        disabled={loading}
                    >
                        <FiRotateCcw size={14} />
                        {loading ? 'Rolling back...' : 'Confirm Rollback'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CascadeRollback;
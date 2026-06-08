import React, { useState } from 'react';
import { FiLock, FiAlertTriangle } from 'react-icons/fi';

const PhasingLockCycle = ({ onLock, loading }) => {
    const [performanceCycle, setPerformanceCycle] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();
    const defaultCycle = `FY${currentYear}`;

    const handleLock = () => {
        if (confirmText !== 'LOCK') {
            setError('Please type "LOCK" to confirm');
            return;
        }
        onLock(performanceCycle || defaultCycle);
    };

    return (
        <div className="kpi-phasing-lock-modal">
            <div className="kpi-phasing-lock-container">
                <div className="kpi-phasing-lock-header">
                    <FiLock size={24} color="var(--kpi-warning)" />
                    <h3>Lock Phasing Cycle</h3>
                </div>
                
                <div className="kpi-phasing-lock-body">
                    <div className="kpi-phasing-lock-warning">
                        <FiAlertTriangle size={20} />
                        <p>This action is <strong>irreversible</strong>. Once locked, monthly targets cannot be modified.</p>
                    </div>
                    
                    <div className="kpi-phasing-lock-form-group">
                        <label>Performance Cycle (Optional)</label>
                        <input 
                            type="text"
                            className="kpi-phasing-lock-input"
                            value={performanceCycle}
                            onChange={(e) => setPerformanceCycle(e.target.value)}
                            placeholder={`e.g., ${defaultCycle}`}
                        />
                        <span className="hint">Leave empty to use {defaultCycle}</span>
                    </div>
                    
                    <div className="kpi-phasing-lock-form-group">
                        <label>Type <strong>LOCK</strong> to confirm</label>
                        <input 
                            type="text"
                            className="kpi-phasing-lock-input"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type LOCK here"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-phasing-lock-footer">
                    <button className="cancel" onClick={() => window.location.reload()}>
                        Cancel
                    </button>
                    <button 
                        className="lock"
                        onClick={handleLock}
                        disabled={loading}
                    >
                        <FiLock size={14} />
                        {loading ? 'Locking...' : 'Lock Cycle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhasingLockCycle;
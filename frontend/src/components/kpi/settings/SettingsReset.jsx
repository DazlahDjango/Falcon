import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const SettingsReset = ({ onConfirm, onCancel }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    
    const handleConfirm = () => {
        if (confirmText !== 'RESET') {
            setError('Please type "RESET" to confirm');
            return;
        }
        onConfirm();
    };
    
    return (
        <div className="settings-reset-modal">
            <div className="settings-reset-container">
                <div className="settings-reset-header">
                    <FiAlertTriangle size={24} color="var(--kpi-danger)" />
                    <h3>Reset System Settings</h3>
                    <button className="close-btn" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="settings-reset-body">
                    <p>This action will <strong>reset all KPI system settings to factory defaults</strong>.</p>
                    <div className="warning">
                        <FiAlertTriangle size={16} />
                        <span>This action cannot be undone. All custom configurations will be lost.</span>
                    </div>
                    
                    <div className="confirm-group">
                        <label>Type <strong>RESET</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type RESET here"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="settings-reset-footer">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="reset-btn" onClick={handleConfirm}>Reset Settings</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsReset;
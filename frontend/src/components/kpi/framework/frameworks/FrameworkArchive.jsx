import React, { useState } from 'react';
import { FiArchive, FiAlertTriangle } from 'react-icons/fi';

const FrameworkArchive = ({ framework, onConfirm, onCancel }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (confirmText !== 'ARCHIVE') {
            setError('Please type "ARCHIVE" to confirm');
            return;
        }
        onConfirm();
    };

    return (
        <div className="kpi-framework-archive-modal">
            <div className="kpi-framework-archive-container">
                <div className="kpi-framework-archive-header">
                    <FiArchive size={24} color="var(--kpi-warning)" />
                    <h3>Archive Framework</h3>
                </div>
                
                <div className="kpi-framework-archive-body">
                    <p>Are you sure you want to archive <strong>{framework?.name}</strong>?</p>
                    <div className="warning">
                        <FiAlertTriangle size={16} />
                        <span>Archived frameworks will be hidden from regular users but can be restored later.</span>
                    </div>
                    
                    <div className="confirm-group">
                        <label>Type <strong>ARCHIVE</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type ARCHIVE here"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-framework-archive-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm" onClick={handleConfirm}>Archive Framework</button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkArchive;
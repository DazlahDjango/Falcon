import React, { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const FrameworkPublish = ({ framework, onConfirm, onCancel }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (confirmText !== 'PUBLISH') {
            setError('Please type "PUBLISH" to confirm');
            return;
        }
        onConfirm();
    };

    return (
        <div className="kpi-framework-publish-modal">
            <div className="kpi-framework-publish-container">
                <div className="kpi-framework-publish-header">
                    <FiCheckCircle size={24} color="var(--kpi-success)" />
                    <h3>Publish Framework</h3>
                </div>
                
                <div className="kpi-framework-publish-body">
                    <p>Are you sure you want to publish <strong>{framework?.name}</strong>?</p>
                    <div className="warning">
                        <FiAlertTriangle size={16} />
                        <span>Once published, this framework will be visible to all users and cannot be edited.</span>
                    </div>
                    
                    <div className="confirm-group">
                        <label>Type <strong>PUBLISH</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type PUBLISH here"
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-framework-publish-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm" onClick={handleConfirm}>Publish Framework</button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkPublish;
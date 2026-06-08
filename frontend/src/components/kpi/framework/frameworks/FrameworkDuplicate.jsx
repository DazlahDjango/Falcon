import React from 'react';
import { FiCopy } from 'react-icons/fi';

const FrameworkDuplicate = ({ framework, onConfirm, onCancel }) => {
    return (
        <div className="kpi-framework-duplicate-modal">
            <div className="kpi-framework-duplicate-container">
                <div className="kpi-framework-duplicate-header">
                    <FiCopy size={24} color="var(--kpi-primary)" />
                    <h3>Duplicate Framework</h3>
                </div>
                
                <div className="kpi-framework-duplicate-body">
                    <p>Create a copy of <strong>{framework?.name}</strong>?</p>
                    <p className="info">The new framework will be created as a draft with "Copy" appended to the name.</p>
                </div>
                
                <div className="kpi-framework-duplicate-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm" onClick={onConfirm}>Duplicate Framework</button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkDuplicate;
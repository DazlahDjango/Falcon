import React, { useState } from 'react';
import { FiCopy, FiX } from 'react-icons/fi';

const TemplateUseConfirm = ({ template, frameworks, onConfirm, onCancel }) => {
    const [frameworkId, setFrameworkId] = useState('');

    const handleConfirm = () => {
        if (!frameworkId) {
            alert('Please select a framework');
            return;
        }
        onConfirm(frameworkId);
    };

    return (
        <div className="kpi-template-use-modal">
            <div className="kpi-template-use-container">
                <div className="kpi-template-use-header">
                    <FiCopy size={24} color="var(--kpi-primary)" />
                    <h3>Use Template</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-template-use-body">
                    <p>Create a new KPI from <strong>{template?.name}</strong> template?</p>
                    
                    <div className="form-group">
                        <label>Select Framework</label>
                        <select 
                            value={frameworkId}
                            onChange={(e) => setFrameworkId(e.target.value)}
                        >
                            <option value="">Select a framework...</option>
                            {frameworks?.map(fw => (
                                <option key={fw.id} value={fw.id}>{fw.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <p className="info">The KPI will be created as a draft and can be customized further.</p>
                </div>
                
                <div className="kpi-template-use-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm" onClick={handleConfirm}>Create KPI from Template</button>
                </div>
            </div>
        </div>
    );
};

export default TemplateUseConfirm;
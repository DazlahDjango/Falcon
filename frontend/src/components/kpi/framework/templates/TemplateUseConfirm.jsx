import React, { useState } from 'react';
import { FiCopy, FiX } from 'react-icons/fi';

const TemplateUseConfirm = ({ template, frameworks, onConfirm, onCancel }) => {
    const [frameworkId, setFrameworkId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        if (!frameworkId) {
            setError('Please select a framework');
            return;
        }
        
        setError(null);
        setIsLoading(true);

        try {
            console.log('Creating KPI from template:', template?.id, 'in framework:', frameworkId);
            await onConfirm(frameworkId);
            console.log('KPI creation from template successful');
        } catch (err) {
            console.error('KPI creation error:', err);
            setError(err?.message || 'Failed to create Performance Indicator from template. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                    {error && (
                        <div className="form-error-alert">
                            <span>{error}</span>
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    <p>Create a new Performance Indicator from <strong>{template?.name}</strong> template?</p>
                    
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
                    
                    <p className="info">The Performance Indicator will be created as a draft and can be customized further.</p>
                </div>
                
                <div className="kpi-template-use-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="confirm" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Performance Indicator from Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateUseConfirm;
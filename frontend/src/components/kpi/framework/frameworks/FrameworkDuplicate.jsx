import React, { useState } from 'react';
import { FiCopy, FiX } from 'react-icons/fi';

const FrameworkDuplicate = ({ framework, onConfirm, onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setError(null);
        setIsLoading(true);

        try {
            console.log('Duplicating framework:', framework?.id);
            await onConfirm();
            console.log('Framework duplication successful');
        } catch (err) {
            console.error('Framework duplication error:', err);
            setError(err?.message || 'Failed to duplicate framework. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="kpi-framework-duplicate-modal">
            <div className="kpi-framework-duplicate-container">
                <div className="kpi-framework-duplicate-header">
                    <FiCopy size={24} color="var(--kpi-primary)" />
                    <h3>Duplicate Framework</h3>
                </div>
                
                <div className="kpi-framework-duplicate-body">
                    {error && (
                        <div className="form-error-alert">
                            <span>{error}</span>
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    <p>Create a copy of <strong>{framework?.name}</strong>?</p>
                    <p className="info">The new framework will be created as a draft with "Copy" appended to the name.</p>
                </div>
                
                <div className="kpi-framework-duplicate-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="confirm" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Duplicating...' : 'Duplicate Framework'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkDuplicate;
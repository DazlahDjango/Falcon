import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const SectorDeleteConfirm = ({ sector, onConfirm, onCancel }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (confirmText !== sector.name) {
            setError(`Please type "${sector.name}" to confirm`);
            return;
        }
        onConfirm();
    };

    return (
        <div className="kpi-sector-delete-modal">
            <div className="kpi-sector-delete-container">
                <div className="kpi-sector-delete-header">
                    <FiAlertTriangle size={24} color="var(--kpi-danger)" />
                    <h3>Delete Sector</h3>
                </div>
                
                <div className="kpi-sector-delete-body">
                    <p>Are you sure you want to delete <strong>{sector.name}</strong>?</p>
                    <p className="warning">This action cannot be undone. All frameworks and KPIs in this sector may be affected.</p>
                    
                    <div className="confirm-group">
                        <label>Type <strong>{sector.name}</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder={`Type ${sector.name} here`}
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-sector-delete-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="delete" onClick={handleConfirm}>Delete Sector</button>
                </div>
            </div>
        </div>
    );
};

export default SectorDeleteConfirm;
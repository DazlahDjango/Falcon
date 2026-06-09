import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const CategoryDeleteConfirm = ({ category, hasChildren, onConfirm, onCancel }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (confirmText !== category.name) {
            setError(`Please type "${category.name}" to confirm`);
            return;
        }
        
        setError('');
        setIsLoading(true);

        try {
            console.log('Deleting category:', category?.id);
            await onConfirm();
            console.log('Category deletion successful');
        } catch (err) {
            console.error('Category deletion error:', err);
            setError(err?.message || 'Failed to delete category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="kpi-category-delete-modal">
            <div className="kpi-category-delete-container">
                <div className="kpi-category-delete-header">
                    <FiAlertTriangle size={24} color="var(--kpi-danger)" />
                    <h3>Delete Category</h3>
                </div>
                
                <div className="kpi-category-delete-body">
                    <p>Are you sure you want to delete <strong>{category.name}</strong>?</p>
                    {hasChildren && (
                        <div className="warning">
                            <FiAlertTriangle size={16} />
                            <span>This category has {hasChildren} subcategory(ies). They will become root categories.</span>
                        </div>
                    )}
                    
                    <div className="confirm-group">
                        <label>Type <strong>{category.name}</strong> to confirm</label>
                        <input 
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder={`Type ${category.name} here`}
                        />
                        {error && <span className="error">{error}</span>}
                    </div>
                </div>
                
                <div className="kpi-category-delete-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="delete" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryDeleteConfirm;
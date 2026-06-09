import React, { useState } from 'react';
import { FiMove, FiX } from 'react-icons/fi';

const CategoryMove = ({ category, categories, onMove, onCancel }) => {
    const [targetParentId, setTargetParentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMove = async () => {
        setError(null);
        setIsLoading(true);

        try {
            console.log('Moving category to:', targetParentId || null);
            await onMove(targetParentId || null);
            console.log('Category move successful');
        } catch (err) {
            console.error('Category move error:', err);
            setError(err?.message || 'Failed to move category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="kpi-category-move-modal">
            <div className="kpi-category-move-container">
                <div className="kpi-category-move-header">
                    <FiMove size={20} />
                    <h3>Move Category</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-category-move-body">
                    {error && (
                        <div className="form-error-alert">
                            <span>{error}</span>
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                    <p>Moving: <strong>{category.name}</strong></p>
                    
                    <div className="form-group">
                        <label>New Parent Category</label>
                        <select 
                            value={targetParentId}
                            onChange={(e) => setTargetParentId(e.target.value)}
                        >
                            <option value="">None (Root Level)</option>
                            {categories?.filter(c => c.id !== category.id).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="kpi-category-move-footer">
                    <button className="cancel" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="submit" onClick={handleMove} disabled={isLoading}>
                        {isLoading ? 'Moving...' : 'Move Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryMove;
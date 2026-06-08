import React, { useState } from 'react';
import { FiMove, FiX } from 'react-icons/fi';

const CategoryMove = ({ category, categories, onMove, onCancel }) => {
    const [targetParentId, setTargetParentId] = useState('');

    const handleMove = () => {
        onMove(targetParentId || null);
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
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="submit" onClick={handleMove}>Move Category</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryMove;
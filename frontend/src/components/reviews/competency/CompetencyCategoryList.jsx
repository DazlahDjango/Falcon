// src/components/reviews/competency/CompetencyCategoryList.jsx
import React, { useState } from 'react';
import './competency.css';

const CompetencyCategoryList = ({ 
    categories = [], 
    loading = false, 
    onEdit,
    onDelete,
    onCreateClick,
    canManage = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="competency-loading">Loading categories...</div>;
    }

    return (
        <div className="competency-container">
            <div className="competency-header">
                <div>
                    <h2 className="competency-title">Competency Categories</h2>
                    <p className="competency-subtitle">Group competencies for better organization</p>
                </div>
                {canManage && onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Category
                    </button>
                )}
            </div>

            <div className="competency-filters" style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ width: '300px' }}
                />
            </div>

            {filteredCategories.length === 0 ? (
                <div className="competency-empty">
                    <p>No competency categories found.</p>
                    {canManage && onCreateClick && (
                        <button className="btn-primary" onClick={onCreateClick} style={{ marginTop: '1rem' }}>
                            Create First Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="category-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredCategories.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <span className="category-name">{category.name}</span>
                                <span className="category-count">
                                    {category.competencies_count || 0} competencies
                                </span>
                            </div>
                            {category.description && (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>
                                    {category.description}
                                </p>
                            )}
                            <div className="category-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                                {canManage && (
                                    <>
                                        <button className="btn-outline" onClick={() => onEdit(category.id)} style={{ padding: '0.25rem 0.75rem' }}>
                                            Edit
                                        </button>
                                        <button className="btn-outline" onClick={() => onDelete(category.id)} style={{ padding: '0.25rem 0.75rem', color: '#ef4444' }}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompetencyCategoryList;
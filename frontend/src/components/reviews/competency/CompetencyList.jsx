// src/components/reviews/competency/CompetencyList.jsx
import React, { useState } from 'react';
import './competency.css';
import { REVIEW_COMPETENCY_TYPE_LABELS } from '@/config/constants';

const CompetencyList = ({ 
    competencies = [], 
    categories = [],
    loading = false, 
    onEdit,
    onDelete,
    onCreateClick,
    canManage = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterActive, setFilterActive] = useState(true);

    const filteredCompetencies = competencies.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || comp.category_id === filterCategory;
        const matchesType = !filterType || comp.competency_type === filterType;
        const matchesActive = !filterActive || comp.is_active;
        return matchesSearch && matchesCategory && matchesType && matchesActive;
    });

    const getTypeClass = (type) => {
        switch (type) {
            case 'leadership': return 'competency-type-leadership';
            case 'technical': return 'competency-type-technical';
            case 'soft_skill': return 'competency-type-soft_skill';
            case 'cultural': return 'competency-type-cultural';
            default: return '';
        }
    };

    const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
    }, {});

    const typeOptions = Object.entries(REVIEW_COMPETENCY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

    const stats = {
        total: competencies.length,
        active: competencies.filter(c => c.is_active).length,
        required: competencies.filter(c => c.is_required).length,
    };

    if (loading) {
        return <div className="competency-loading">Loading competencies...</div>;
    }

    return (
        <div className="competency-container">
            <div className="competency-header">
                <div>
                    <h2 className="competency-title">Competencies</h2>
                    <p className="competency-subtitle">Define skills and behaviors evaluated in reviews</p>
                </div>
                {canManage && onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Competency
                    </button>
                )}
            </div>

            <div className="competency-stats">
                <div className="competency-stat-card">
                    <div className="competency-stat-value">{stats.total}</div>
                    <div className="competency-stat-label">Total</div>
                </div>
                <div className="competency-stat-card">
                    <div className="competency-stat-value">{stats.active}</div>
                    <div className="competency-stat-label">Active</div>
                </div>
                <div className="competency-stat-card">
                    <div className="competency-stat-value">{stats.required}</div>
                    <div className="competency-stat-label">Required</div>
                </div>
            </div>

            <div className="competency-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search competencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ width: '250px' }}
                />
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="form-select"
                    style={{ width: '180px' }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-select"
                    style={{ width: '150px' }}
                >
                    <option value="">All Types</option>
                    {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={filterActive}
                        onChange={(e) => setFilterActive(e.target.checked)}
                    />
                    Active only
                </label>
            </div>

            {filteredCompetencies.length === 0 ? (
                <div className="competency-empty">
                    <p>No competencies found.</p>
                    {canManage && onCreateClick && (
                        <button className="btn-primary" onClick={onCreateClick} style={{ marginTop: '1rem' }}>
                            Create First Competency
                        </button>
                    )}
                </div>
            ) : (
                <div className="competency-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                    {filteredCompetencies.map(comp => (
                        <div key={comp.id} className="competency-card">
                            <div className="competency-card-header">
                                <span className="competency-card-name">{comp.name}</span>
                                <span className={`competency-card-type ${getTypeClass(comp.competency_type)}`}>
                                    {REVIEW_COMPETENCY_TYPE_LABELS[comp.competency_type] || comp.competency_type}
                                </span>
                            </div>
                            <div className="competency-card-description">{comp.description}</div>
                            <div className="competency-card-footer">
                                <span>Weight: {comp.default_weight}%</span>
                                <span>Category: {categoryMap[comp.category_id] || 'Uncategorized'}</span>
                                {comp.is_required && <span style={{ color: '#f59e0b' }}>⭐ Required</span>}
                            </div>
                            {canManage && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button className="btn-outline" onClick={() => onEdit(comp.id)} style={{ padding: '0.25rem 0.75rem' }}>
                                        Edit
                                    </button>
                                    <button className="btn-outline" onClick={() => onDelete(comp.id)} style={{ padding: '0.25rem 0.75rem', color: '#ef4444' }}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompetencyList;
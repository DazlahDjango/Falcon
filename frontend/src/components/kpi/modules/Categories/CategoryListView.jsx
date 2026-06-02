import React from 'react';
import { FiFolder, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const CategoryListView = ({ categories, loading, onEdit, onDelete, onView }) => {
    if (loading) {
        return (
            <div className="category-loading">
                <div className="spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="category-empty">
                <div className="empty-icon">🔍</div>
                <h3>No Categories Found</h3>
                <p>Try adjusting your filters or create a new category.</p>
            </div>
        );
    }

    const getCategoryTypeColor = (type) => {
        switch (type) {
            case 'FINANCIAL': return '#10b981';
            case 'IMPACT': return '#8b5cf6';
            case 'OPERATIONAL': return '#3b82f6';
            case 'CUSTOMER': return '#f59e0b';
            case 'INTERNAL': return '#ef4444';
            case 'GROWTH': return '#06b6d4';
            case 'COMPLIANCE': return '#6b7280';
            default: return '#6c757d';
        }
    };

    return (
        <div className="category-list-view">
            <table className="category-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Parent</th>
                        <th>KPIs</th>
                        <th>Status</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                        <tr key={category.id} onClick={() => onView(category)} className="clickable-row">
                            <td>
                                <div className="category-name-cell">
                                    <div
                                        className="category-color-dot"
                                        style={{ backgroundColor: getCategoryTypeColor(category.category_type) }}
                                    />
                                    <FiFolder size={14} className="category-icon" />
                                    <span>{category.name}</span>
                                </div>
                            </td>
                            <td><code>{category.code}</code></td>
                            <td>
                                <span className="type-badge" style={{ backgroundColor: getCategoryTypeColor(category.category_type) + '20', color: getCategoryTypeColor(category.category_type) }}>
                                    {category.category_type}
                                </span>
                            </td>
                            <td>{category.parent_name || '—'}</td>
                            <td>{category.kpi_count || 0}</td>
                            <td>
                                <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>{category.display_order || 0}</td>
                            <td className="actions-cell">
                                <button
                                    className="action-btn view"
                                    onClick={(e) => { e.stopPropagation(); onView(category); }}
                                    title="View"
                                >
                                    <FiEye size={14} />
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                                    title="Edit"
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
                                    title="Delete"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryListView;
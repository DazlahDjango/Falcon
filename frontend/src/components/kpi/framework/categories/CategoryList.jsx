import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import CategoryTree from './CategoryTree';
import CategoryForm from './CategoryForm';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';

const CategoryList = ({ 
    categories, 
    frameworks,
    loading, 
    onCreate, 
    onUpdate, 
    onDelete,
    onMove,
    onReorder,
    canManage 
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [parentCategory, setParentCategory] = useState(null);

    const handleAddSubcategory = (parent) => {
        setParentCategory(parent);
        setShowForm(true);
    };

    if (loading) {
        return <KPILoading text="Loading Key Result Areas..." />;
    }

    const categoryTree = buildCategoryTree(categories);

    return (
        <div className="kpi-categories-container">
            <div className="kpi-categories-header">
                <div>
                    <h2>Key Result Areas</h2>
                    <p>Organize Performance Indicators into hierarchical Key Result Areas</p>
                </div>
                {canManage && (
                    <button className="kpi-categories-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={16} />
                        Add Key Result Area
                    </button>
                )}
            </div>
            
            {categories?.length === 0 ? (
                <KPIEmptyState 
                    icon="📁"
                    title="No Key Result Areas Found"
                    description="No Key Result Areas have been created yet"
                    actionText={canManage ? "Create Key Result Area" : null}
                    onAction={canManage ? () => setShowForm(true) : null}
                />
            ) : (
                <CategoryTree 
                    categories={categoryTree}
                    onEdit={setEditingCategory}
                    onDelete={onDelete}
                    onMove={onMove}
                    onAddSubcategory={handleAddSubcategory}
                    canManage={canManage}
                />
            )}
            
            {showForm && (
                <CategoryForm 
                    parentCategory={parentCategory}
                    frameworks={frameworks}
                    categories={categories}
                    onSubmit={async (data) => {
                        await onCreate(data);
                        setShowForm(false);
                        setParentCategory(null);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setParentCategory(null);
                    }}
                />
            )}
            
            {editingCategory && (
                <CategoryForm 
                    category={editingCategory}
                    frameworks={frameworks}
                    categories={categories}
                    onSubmit={async (data) => {
                        await onUpdate(editingCategory.id, data);
                        setEditingCategory(null);
                    }}
                    onCancel={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
};

const buildCategoryTree = (categories, parentId = null) => {
    return categories
        ?.filter(cat => cat.parent === parentId || (parentId === null && !cat.parent))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(cat => ({
            ...cat,
            children: buildCategoryTree(categories, cat.id)
        })) || [];
};

export default CategoryList;
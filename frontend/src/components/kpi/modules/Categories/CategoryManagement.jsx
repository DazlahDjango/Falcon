import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiFolder, FiGrid } from 'react-icons/fi';
import { useCategories, useFrameworks } from '../../../../hooks/kpi';
import CategoryTree from './CategoryTree';
import CategoryForm from './CategoryForm';
import CategoryDetail from './CategoryDetail';
import CategoryFilters from './CategoryFilters';
import CategoryBreadcrumb from './CategoryBreadcrumb';

const CategoryManagement = () => {
    const [viewMode, setViewMode] = useState('tree'); // tree, list, create, edit, detail
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedFramework, setSelectedFramework] = useState(null);
    const [filters, setFilters] = useState({
        framework: '',
        categoryType: '',
        isActive: '',
        search: '',
    });

    const {
        categories,
        categoryTree,
        loading,
        error,
        fetchAll,
        fetchByFramework,
        create,
        update,
        delete: deleteCategory,
        move,
        reorder,
        setCurrent
    } = useCategories(true);

    const { frameworks, fetchAll: fetchFrameworks } = useFrameworks(true);

    useEffect(() => {
        fetchFrameworks({ status: 'PUBLISHED' });
    }, []);

    const handleFrameworkChange = (frameworkId) => {
        setSelectedFramework(frameworkId);
        setFilters({ ...filters, framework: frameworkId });
        if (frameworkId) {
            fetchByFramework(frameworkId);
        } else {
            fetchAll();
        }
    };

    const handleCreate = async (data) => {
        try {
            await create(data);
            setViewMode('tree');
            if (selectedFramework) {
                fetchByFramework(selectedFramework);
            } else {
                fetchAll();
            }
        } catch (err) {
            console.error('Create failed:', err);
            throw err;
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await update(id, data);
            setViewMode('tree');
            if (selectedFramework) {
                fetchByFramework(selectedFramework);
            } else {
                fetchAll();
            }
        } catch (err) {
            console.error('Update failed:', err);
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? All child categories will also be deleted.')) {
            await deleteCategory(id);
            if (selectedFramework) {
                fetchByFramework(selectedFramework);
            } else {
                fetchAll();
            }
        }
    };

    const handleMove = async (id, parentId) => {
        await move(id, parentId);
        if (selectedFramework) {
            fetchByFramework(selectedFramework);
        } else {
            fetchAll();
        }
    };

    const handleReorder = async (reorderedCategories) => {
        await reorder(reorderedCategories);
        if (selectedFramework) {
            fetchByFramework(selectedFramework);
        } else {
            fetchAll();
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setViewMode('edit');
    };

    const handleViewDetail = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const filteredCategories = categories.filter(cat => {
        if (filters.categoryType && cat.category_type !== filters.categoryType) return false;
        if (filters.isActive === 'true' && !cat.is_active) return false;
        if (filters.isActive === 'false' && cat.is_active) return false;
        if (filters.search && !cat.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !cat.code.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    if (viewMode === 'create') {
        return (
            <div className="category-management">
                <CategoryForm
                    frameworks={frameworks}
                    selectedFramework={selectedFramework}
                    categories={categories}
                    onSubmit={handleCreate}
                    onCancel={() => setViewMode('tree')}
                    title="Create New Category"
                />
            </div>
        );
    }

    if (viewMode === 'edit' && selectedCategory) {
        return (
            <div className="category-management">
                <CategoryForm
                    frameworks={frameworks}
                    categories={categories}
                    initialData={selectedCategory}
                    onSubmit={(data) => handleUpdate(selectedCategory.id, data)}
                    onCancel={() => setViewMode('tree')}
                    title="Edit Category"
                />
            </div>
        );
    }

    if (viewMode === 'detail' && selectedCategory) {
        return (
            <div className="category-management">
                <CategoryDetail
                    category={selectedCategory}
                    onEdit={() => handleEdit(selectedCategory)}
                    onDelete={() => handleDelete(selectedCategory.id)}
                    onBack={() => setViewMode('tree')}
                />
            </div>
        );
    }

    return (
        <div className="category-management">
            <div className="category-header">
                <div>
                    <h1 className="category-title">KPI Categories</h1>
                    <p className="category-subtitle">Organize KPIs into hierarchical categories</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                            onClick={() => setViewMode('tree')}
                            title="Tree View"
                        >
                            <FiFolder size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FiGrid size={18} />
                        </button>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setSelectedCategory(null);
                            setViewMode('create');
                        }}
                    >
                        <FiPlus size={16} />
                        Create Category
                    </button>
                </div>
            </div>

            <CategoryFilters
                frameworks={frameworks}
                selectedFramework={selectedFramework}
                filters={filters}
                onFrameworkChange={handleFrameworkChange}
                onFilterChange={setFilters}
                onRefresh={() => selectedFramework ? fetchByFramework(selectedFramework) : fetchAll()}
                loading={loading}
            />

            <CategoryBreadcrumb
                categories={categories}
                selectedCategory={selectedCategory}
                onNavigate={(category) => handleViewDetail(category)}
            />

            {error && (
                <div className="alert-error">
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => selectedFramework ? fetchByFramework(selectedFramework) : fetchAll()} className="alert-retry">
                        <FiRefreshCw size={14} />
                        Retry
                    </button>
                </div>
            )}

            {viewMode === 'tree' ? (
                <CategoryTree
                    categories={filteredCategories}
                    categoryTree={categoryTree}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                    onMove={handleMove}
                    onReorder={handleReorder}
                    selectedFramework={selectedFramework}
                />
            ) : (
                <CategoryListView
                    categories={filteredCategories}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                />
            )}
        </div>
    );
};

export default CategoryManagement;
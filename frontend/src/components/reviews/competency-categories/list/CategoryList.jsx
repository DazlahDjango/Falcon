// src/components/reviews/competency-categories/list/CategoryList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Layers } from 'lucide-react';
import { useCompetencyCategories } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar } from '../../common';
import CategoryCard from './CategoryCard';
import CategoryTree from './CategoryTree';

const CategoryList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useCompetencyCategories();
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters({ search: searchTerm });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleCreate = () => {
    navigate('/reviews/competency-categories/create');
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading competency categories..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="category-list">
      <div className="category-list-header">
        <div className="category-list-title-section">
          <h1 className="category-list-title">Competency Categories</h1>
          <span className="category-list-count">{pagination.totalItems} categories</span>
        </div>
        <div className="category-list-actions">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Layers size={18} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
            aria-label="Tree view"
          >
            <Layers size={18} />
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Category
            </button>
          )}
        </div>
      </div>

      <div className="category-list-toolbar">
        <ReviewSearchBar
          placeholder="Search categories..."
          onSearch={handleSearch}
          className="category-search"
        />
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No Competency Categories Found"
          description="Create your first competency category to organize competencies."
          icon="📂"
          actionLabel="Create Category"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="category-grid">
              {data.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <CategoryTree categories={data} />
          )}
          <ReviewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default CategoryList;
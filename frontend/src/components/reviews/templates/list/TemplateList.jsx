// src/components/reviews/templates/list/TemplateList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, FileText, Copy } from 'lucide-react';
import { useTemplates } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import TemplateCard from './TemplateCard';
import TemplateFilters from './TemplateFilters';

const TemplateList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, getActive, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useTemplates();
  const [viewMode, setViewMode] = useState('grid');
  const [showActive, setShowActive] = useState(false);

  useEffect(() => {
    if (showActive) {
      getActive();
    } else {
      fetchAll({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters,
      });
    }
  }, [pagination.currentPage, pagination.pageSize, filters, showActive, fetchAll, getActive]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters({ search: searchTerm });
  }, [setFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleCreate = () => {
    navigate('/reviews/templates/create');
  };

  const toggleActive = () => {
    setShowActive(!showActive);
    setPagination({ currentPage: 1 });
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading templates..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  const displayData = showActive ? data : data;

  return (
    <div className="template-list">
      <div className="template-list-header">
        <div className="template-list-title-section">
          <h1 className="template-list-title">Review Templates</h1>
          <span className="template-list-count">{pagination.totalItems || displayData.length} templates</span>
        </div>
        <div className="template-list-actions">
          <button
            className={`btn ${showActive ? 'btn-primary' : 'btn-outline'}`}
            onClick={toggleActive}
          >
            <FileText size={18} />
            {showActive ? 'Showing Active' : 'Show Active'}
          </button>
          <div className="template-list-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Template
            </button>
          )}
        </div>
      </div>

      <div className="template-list-toolbar">
        <ReviewSearchBar
          placeholder="Search templates..."
          onSearch={handleSearch}
          className="template-search"
        />
        <TemplateFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {displayData.length === 0 ? (
        <ReviewEmptyState
          title={showActive ? "No Active Templates Found" : "No Templates Found"}
          description={showActive 
            ? "No active templates are available." 
            : "Create a template to standardize review processes."}
          icon="📄"
          actionLabel={canManage ? "Create Template" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="template-grid">
              {displayData.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="template-list-view">
              {displayData.map((template) => (
                <div key={template.id} className="template-list-item" onClick={() => navigate(`/reviews/templates/${template.id}`)}>
                  <div className="template-list-item-info">
                    <h3 className="template-list-item-title">{template.name}</h3>
                    <div className="template-list-item-meta">
                      <span className="template-list-item-version">v{template.version || 1}</span>
                      {template.is_default && (
                        <span className="template-list-item-default">Default</span>
                      )}
                      <span className="template-list-item-sections">
                        {template.included_sections?.length || 0} sections
                      </span>
                    </div>
                  </div>
                  <div className="template-list-item-status">
                    <ReviewStatusBadge status={template.is_active ? 'active' : 'inactive'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!showActive && (
            <ReviewPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TemplateList;
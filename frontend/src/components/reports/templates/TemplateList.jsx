// frontend/src/components/reports/templates/TemplateList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiGrid, FiList, FiRefreshCw, FiFilter, FiCopy } from 'react-icons/fi';
import { MdOutlineDescription } from 'react-icons/md';
import { useTemplates } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../common';
import { TemplateTable } from './TemplateTable';
import { TemplateCard } from './TemplateCard';
import { TemplateFilters } from './TemplateFilters';
import { TemplatePrebuilt } from './TemplatePrebuilt';
import './templates.css';

export const TemplateList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showPrebuilt, setShowPrebuilt] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const {
        templates,
        loading,
        error,
        pagination,
        page,
        pageSize,
        total,
        totalPages,
        filters,
        fetchList,
        remove,
        duplicateTemplate,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearErrors,
        fetchPrebuilt,
        prebuiltTemplates,
    } = useTemplates({
        autoFetch: true,
        filters: { template_type: null, sector: null, category: null, is_published: null, is_system: null, is_default: null },
    });

    useEffect(() => {
        if (filters.search !== searchTerm) {
            updateFilters({ search: searchTerm });
        }
    }, [searchTerm, updateFilters, filters.search]);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        updateFilters({ [key]: value || null });
    }, [updateFilters]);

    const handleResetFilters = useCallback(() => {
        resetAllFilters();
        setSearchTerm('');
    }, [resetAllFilters]);

    const handlePageChange = useCallback((newPage) => {
        updatePagination({ page: newPage });
        fetchList({ page: newPage });
    }, [fetchList, updatePagination]);

    const handlePageSizeChange = useCallback((newSize) => {
        updatePagination({ pageSize: newSize, page: 1 });
        fetchList({ pageSize: newSize, page: 1 });
    }, [fetchList, updatePagination]);

    const handleView = useCallback((id) => {
        navigate(`/reports/templates/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/templates/${id}/edit`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/templates/create');
    }, [navigate]);

    const handleDelete = useCallback((template) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (templateToDelete) {
            await remove(templateToDelete.id);
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
            fetchList();
        }
    }, [templateToDelete, remove, fetchList]);

    const handleDuplicate = useCallback(async (id) => {
        await duplicateTemplate(id);
        fetchList();
    }, [duplicateTemplate, fetchList]);

    const handleApply = useCallback((id) => {
        navigate(`/reports/templates/${id}/apply`);
    }, [navigate]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    const handleTogglePrebuilt = useCallback(async () => {
        if (!showPrebuilt && prebuiltTemplates.length === 0) {
            await fetchPrebuilt();
        }
        setShowPrebuilt(!showPrebuilt);
    }, [showPrebuilt, prebuiltTemplates, fetchPrebuilt]);

    if (loading && !templates.length) {
        return <ReportLoading variant="skeleton" text="Loading templates..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load templates"
            />
        );
    }

    return (
        <div className="template-list-container">
            <div className="template-list-header">
                <div className="header-left">
                    <h1 className="page-title">Report Templates</h1>
                    <span className="template-count">{total} templates</span>
                </div>
                <div className="header-right">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <FiGrid size={18} />
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FiList size={18} />
                        </button>
                    </div>
                    <button
                        className={`btn btn-outline ${showPrebuilt ? 'active' : ''}`}
                        onClick={handleTogglePrebuilt}
                    >
                        <FiCopy size={16} />
                        Prebuilt
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        Filters
                    </button>
                    <button className="btn btn-outline" onClick={handleRefresh}>
                        <FiRefreshCw size={16} />
                    </button>
                    {permissions.canCreateTemplate && (
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <FiPlus size={18} />
                            Create Template
                        </button>
                    )}
                </div>
            </div>

            <div className="template-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search templates..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.template_type || filters.sector || filters.category || filters.is_published !== null || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <TemplateFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {showPrebuilt && (
                <TemplatePrebuilt
                    templates={prebuiltTemplates}
                    loading={loading}
                    onApply={handleApply}
                    onView={handleView}
                />
            )}

            {templates.length === 0 && !showPrebuilt ? (
                <ReportEmptyState
                    title="No Templates Found"
                    description="Create templates to standardize report structures across your organization."
                    icon={<MdOutlineDescription size={48} />}
                    actionText="Create Template"
                    onAction={permissions.canCreateTemplate ? handleCreate : undefined}
                />
            ) : viewMode === 'grid' && !showPrebuilt ? (
                <div className="template-grid">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                            onApply={handleApply}
                        />
                    ))}
                </div>
            ) : !showPrebuilt ? (
                <TemplateTable
                    templates={templates}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onApply={handleApply}
                />
            ) : null}

            {!showPrebuilt && (
                <ReportPagination
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Template"
                message={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setTemplateToDelete(null);
                }}
            />
        </div>
    );
};
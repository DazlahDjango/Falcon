// frontend/src/components/reports/widgets/WidgetList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiGrid, FiList, FiEdit2, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useWidgets } from '../../../hooks/reports';
import { ReportSearchBar, ReportPagination, ReportEmptyState, ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { WidgetCard } from './WidgetCard';
import { WidgetFilters } from './WidgetFilters';
import { WidgetStatusBadge } from './WidgetStatusBadge';
import './widgets.css';

export const WidgetList = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState(null);

    const {
        widgets,
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
        refreshWidget,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearErrors,
    } = useWidgets({
        autoFetch: true,
        filters: { widget_type: null, is_active: null, is_visible: null, dashboard: null },
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
        navigate(`/reports/widgets/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/widgets/${id}/edit`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/widgets/create');
    }, [navigate]);

    const handleDelete = useCallback((widget) => {
        setWidgetToDelete(widget);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (widgetToDelete) {
            await remove(widgetToDelete.id);
            setShowDeleteConfirm(false);
            setWidgetToDelete(null);
            fetchList();
        }
    }, [widgetToDelete, remove, fetchList]);

    const handleRefresh = useCallback(async (id) => {
        await refreshWidget(id);
        fetchList();
    }, [refreshWidget, fetchList]);

    if (loading && !widgets.length) {
        return <ReportLoading variant="skeleton" text="Loading widgets..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load widgets"
            />
        );
    }

    return (
        <div className="widget-list-container">
            <div className="widget-list-header">
                <div className="header-left">
                    <h1 className="page-title">Widgets</h1>
                    <span className="widget-count">{total} widgets</span>
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
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <FiPlus size={18} />
                        Create Widget
                    </button>
                </div>
            </div>

            <div className="widget-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search widgets..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    <WidgetFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>
            </div>

            {widgets.length === 0 ? (
                <ReportEmptyState
                    title="No Widgets Found"
                    description="Create widgets to display data on your dashboards."
                    icon={<MdDashboard size={48} />}
                    actionText="Create Widget"
                    onAction={handleCreate}
                />
            ) : viewMode === 'grid' ? (
                <div className="widget-grid">
                    {widgets.map((widget) => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRefresh={handleRefresh}
                        />
                    ))}
                </div>
            ) : (
                <div className="widget-table-container">
                    <table className="widget-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Dashboard</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {widgets.map((widget) => (
                                <tr key={widget.id}>
                                    <td>
                                        <span className="widget-name">{widget.title || widget.name}</span>
                                    </td>
                                    <td>
                                        <span className="widget-type-badge">{widget.widget_type}</span>
                                    </td>
                                    <td>{widget.dashboard_name || '-'}</td>
                                    <td>
                                        <WidgetStatusBadge
                                            isActive={widget.is_active}
                                            isVisible={widget.is_visible}
                                        />
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn view"
                                                onClick={() => handleView(widget.id)}
                                                title="View Widget"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(widget.id)}
                                                title="Edit Widget"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn refresh"
                                                onClick={() => handleRefresh(widget.id)}
                                                title="Refresh Widget"
                                            >
                                                <FiRefreshCw size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(widget)}
                                                title="Delete Widget"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ReportPagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Widget"
                message={`Are you sure you want to delete the widget "${widgetToDelete?.title || widgetToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setWidgetToDelete(null);
                }}
            />
        </div>
    );
};
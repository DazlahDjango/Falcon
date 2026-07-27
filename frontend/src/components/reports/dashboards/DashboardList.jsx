// frontend/src/components/reports/dashboards/DashboardList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiGrid, FiList, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useDashboards } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../common';
import { DashboardTable } from './DashboardTable';
import { DashboardCard } from './DashboardCard';
import { DashboardFilters } from './DashboardFilters';
import './dashboards.css';

export const DashboardList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [dashboardToDelete, setDashboardToDelete] = useState(null);

    const {
        dashboards,
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
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearErrors,
    } = useDashboards({
        autoFetch: true,
        filters: { dashboard_type: null, is_default: null, is_shared: null, is_published: null },
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
        navigate(`/reports/dashboards/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/dashboards/${id}/edit`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/dashboards/create');
    }, [navigate]);

    const handleDelete = useCallback((dashboard) => {
        setDashboardToDelete(dashboard);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (dashboardToDelete) {
            await remove(dashboardToDelete.id);
            setShowDeleteConfirm(false);
            setDashboardToDelete(null);
            fetchList();
        }
    }, [dashboardToDelete, remove, fetchList]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    if (loading && !dashboards.length) {
        return <ReportLoading variant="skeleton" text="Loading dashboards..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load dashboards"
            />
        );
    }

    return (
        <div className="dashboard-list-container">
            <div className="dashboard-list-header">
                <div className="header-left">
                    <h1 className="page-title">Dashboards</h1>
                    <span className="dashboard-count">{total} dashboards</span>
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
                        className="btn btn-outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        Filters
                    </button>
                    <button className="btn btn-outline" onClick={handleRefresh}>
                        <FiRefreshCw size={16} />
                    </button>
                    {permissions.canCreateDashboard && (
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <FiPlus size={18} />
                            Create Dashboard
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search dashboards..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.dashboard_type || filters.is_default !== null || filters.is_shared !== null || filters.is_published !== null || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <DashboardFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {dashboards.length === 0 ? (
                <ReportEmptyState
                    title="No Dashboards Found"
                    description="Create dashboards to visualize your report data."
                    icon={<MdDashboard size={48} />}
                    actionText="Create Dashboard"
                    onAction={permissions.canCreateDashboard ? handleCreate : undefined}
                />
            ) : viewMode === 'grid' ? (
                <div className="dashboard-grid">
                    {dashboards.map((dashboard) => (
                        <DashboardCard
                            key={dashboard.id}
                            dashboard={dashboard}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <DashboardTable
                    dashboards={dashboards}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
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
                title="Delete Dashboard"
                message={`Are you sure you want to delete the dashboard "${dashboardToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setDashboardToDelete(null);
                }}
            />
        </div>
    );
};
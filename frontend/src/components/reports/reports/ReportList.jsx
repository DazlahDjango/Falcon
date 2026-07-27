// frontend/src/components/reports/reports/ReportList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiPlus, FiGrid, FiList, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { MdOutlineDescription } from 'react-icons/md';
import { useReports } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../common';
import { ReportTable } from './ReportTable';
import { ReportCard } from './ReportCard';
import { ReportFilters } from './ReportFilters';
import './reports.css';

export const ReportList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { permissions } = useReportPermissions();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    const {
        reports,
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
        generationStatus,
        generationProgress,
    } = useReports({
        autoFetch: true,
        filters: { report_type: null, status: null, category: null, is_published: null, is_archived: null },
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
        navigate(`/reports/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/${id}/edit`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/create');
    }, [navigate]);

    const handleDelete = useCallback((report) => {
        setReportToDelete(report);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (reportToDelete) {
            await remove(reportToDelete.id);
            setShowDeleteConfirm(false);
            setReportToDelete(null);
            fetchList();
        }
    }, [reportToDelete, remove, fetchList]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    const handleGenerate = useCallback((id) => {
        navigate(`/reports/${id}/generate`);
    }, [navigate]);

    const handleExport = useCallback((id) => {
        navigate(`/reports/${id}/export`);
    }, [navigate]);

    if (loading && !reports.length) {
        return <ReportLoading variant="skeleton" text="Loading reports..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load reports"
            />
        );
    }

    return (
        <div className="report-list-container">
            <div className="report-list-header">
                <div className="header-left">
                    <h1 className="page-title">Reports</h1>
                    <span className="report-count">{total} reports</span>
                    {generationStatus === 'generating' && (
                        <span className="generation-badge">
                            Generating... {generationProgress}%
                        </span>
                    )}
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
                    {permissions.canCreateReport && (
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <FiPlus size={18} />
                            Create Report
                        </button>
                    )}
                </div>
            </div>

            <div className="report-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search reports..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.report_type || filters.status || filters.category || filters.is_published !== null || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <ReportFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {reports.length === 0 ? (
                <ReportEmptyState
                    title="No Reports Found"
                    description="Create your first report to start tracking performance."
                    icon={<MdOutlineDescription size={48} />}
                    actionText="Create Report"
                    onAction={permissions.canCreateReport ? handleCreate : undefined}
                />
            ) : viewMode === 'grid' ? (
                <div className="report-grid">
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onGenerate={handleGenerate}
                            onExport={handleExport}
                        />
                    ))}
                </div>
            ) : (
                <ReportTable
                    reports={reports}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onGenerate={handleGenerate}
                    onExport={handleExport}
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
                title="Delete Report"
                message={`Are you sure you want to delete the report "${reportToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setReportToDelete(null);
                }}
            />
        </div>
    );
};
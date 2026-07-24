// frontend/src/components/reports/exports/ExportList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiDownload, FiPlus } from 'react-icons/fi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useExports } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
} from '../common';
import { ExportTable } from './ExportTable';
import { ExportFilters } from './ExportFilters';
import { ExportModal } from './ExportModal';
import './exports.css';

export const ExportList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const {
        exports,
        loading,
        error,
        pagination,
        page,
        pageSize,
        total,
        totalPages,
        filters,
        fetchList,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearErrors,
    } = useExports({
        autoFetch: true,
        filters: { format: null, status: null, report: null, exported_by: null },
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
        navigate(`/reports/exports/${id}`);
    }, [navigate]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    const handleCreateExport = useCallback(() => {
        setShowExportModal(true);
    }, []);

    const handleExportModalClose = useCallback(() => {
        setShowExportModal(false);
    }, []);

    if (loading && !exports.length) {
        return <ReportLoading variant="skeleton" text="Loading exports..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load exports"
            />
        );
    }

    return (
        <div className="export-list-container">
            <div className="export-list-header">
                <div className="header-left">
                    <h1 className="page-title">Exports</h1>
                    <span className="export-count">{total} exports</span>
                </div>
                <div className="header-right">
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
                    {permissions.canCreateExport && (
                        <button className="btn btn-primary" onClick={handleCreateExport}>
                            <FiPlus size={18} />
                            New Export
                        </button>
                    )}
                </div>
            </div>

            <div className="export-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search exports..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.format || filters.status || filters.report || filters.exported_by || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <ExportFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {exports.length === 0 ? (
                <ReportEmptyState
                    title="No Exports Found"
                    description="Export reports to download or share with stakeholders."
                    icon={<MdOutlineFileDownload size={48} />}
                    actionText="New Export"
                    onAction={permissions.canCreateExport ? handleCreateExport : undefined}
                />
            ) : (
                <ExportTable
                    exports={exports}
                    onView={handleView}
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

            <ExportModal
                isOpen={showExportModal}
                onClose={handleExportModalClose}
                onSuccess={() => {
                    handleExportModalClose();
                    fetchList();
                }}
            />
        </div>
    );
};
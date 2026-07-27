// frontend/src/components/reports/shares/ShareList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiPlus, FiShare2 } from 'react-icons/fi';
import { MdOutlineShare } from 'react-icons/md';
import { useShares } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../common';
import { ShareTable } from './ShareTable';
import { ShareFilters } from './ShareFilters';
import './shares.css';

export const ShareList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [shareToDelete, setShareToDelete] = useState(null);

    const {
        shares,
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
    } = useShares({
        autoFetch: true,
        filters: { share_type: null, permission: null, is_active: null, report: null },
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
        navigate(`/reports/shares/${id}`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/shares/create');
    }, [navigate]);

    const handleDelete = useCallback((share) => {
        setShareToDelete(share);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (shareToDelete) {
            await remove(shareToDelete.id);
            setShowDeleteConfirm(false);
            setShareToDelete(null);
            fetchList();
        }
    }, [shareToDelete, remove, fetchList]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    if (loading && !shares.length) {
        return <ReportLoading variant="skeleton" text="Loading shares..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load shares"
            />
        );
    }

    return (
        <div className="share-list-container">
            <div className="share-list-header">
                <div className="header-left">
                    <h1 className="page-title">Shares</h1>
                    <span className="share-count">{total} shares</span>
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
                    {permissions.canCreateShare && (
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <FiPlus size={18} />
                            Share Report
                        </button>
                    )}
                </div>
            </div>

            <div className="share-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search shares..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.share_type || filters.permission || filters.is_active !== null || filters.report || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <ShareFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {shares.length === 0 ? (
                <ReportEmptyState
                    title="No Shares Found"
                    description="Share reports with team members or external stakeholders."
                    icon={<MdOutlineShare size={48} />}
                    actionText="Share Report"
                    onAction={permissions.canCreateShare ? handleCreate : undefined}
                />
            ) : (
                <ShareTable
                    shares={shares}
                    onView={handleView}
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
                title="Delete Share"
                message={`Are you sure you want to delete this share? The share link will no longer work.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setShareToDelete(null);
                }}
            />
        </div>
    );
};
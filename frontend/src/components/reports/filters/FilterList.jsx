// frontend/src/components/reports/filters/FilterList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiSearch, FiPlus, FiFilter, FiEdit2, FiTrash2, FiCopy, FiStar } from 'react-icons/fi';
import { MdOutlineFilterList } from 'react-icons/md';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import { useFilters } from '../../../hooks/reports';
import { ReportSearchBar, ReportPagination, ReportEmptyState, ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { FilterTable } from './FilterTable';
import { FilterStatusBadge } from './FilterStatusBadge';
import { FilterTypes } from './FilterTypes';
import './filters.css';

export const FilterList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [filterToDelete, setFilterToDelete] = useState(null);

    const {
        filters,
        loading,
        error,
        pagination,
        page,
        pageSize,
        total,
        totalPages,
        filtersState,
        fetchList,
        remove,
        setDefaultFilter,
        duplicateFilter,
        updateFiltersState,
        resetAllFiltersState,
        updatePagination,
        clearErrors,
    } = useFilters({
        autoFetch: true,
        filters: { filter_type: null, is_global: null, is_system: null, is_default: null },
    });

    useEffect(() => {
        if (filtersState.search !== searchTerm) {
            updateFiltersState({ search: searchTerm });
        }
    }, [searchTerm, updateFiltersState, filtersState.search]);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        updateFiltersState({ [key]: value || null });
    }, [updateFiltersState]);

    const handleResetFilters = useCallback(() => {
        resetAllFiltersState();
        setSearchTerm('');
    }, [resetAllFiltersState]);

    const handlePageChange = useCallback((newPage) => {
        updatePagination({ page: newPage });
        fetchList({ page: newPage });
    }, [fetchList, updatePagination]);

    const handlePageSizeChange = useCallback((newSize) => {
        updatePagination({ pageSize: newSize, page: 1 });
        fetchList({ pageSize: newSize, page: 1 });
    }, [fetchList, updatePagination]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/filters/${id}/edit`);
    }, [navigate]);

    const handleView = useCallback((id) => {
        navigate(`/reports/filters/${id}`);
    }, [navigate]);

    const handleDelete = useCallback((filter) => {
        setFilterToDelete(filter);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (filterToDelete) {
            await remove(filterToDelete.id);
            setShowDeleteConfirm(false);
            setFilterToDelete(null);
            fetchList();
        }
    }, [filterToDelete, remove, fetchList]);

    const handleSetDefault = useCallback(async (id) => {
        await setDefaultFilter(id);
        fetchList();
    }, [setDefaultFilter, fetchList]);

    const handleDuplicate = useCallback(async (id) => {
        await duplicateFilter(id);
        fetchList();
    }, [duplicateFilter, fetchList]);

    const handleCreate = useCallback(() => {
        navigate('/reports/filters/create');
    }, [navigate]);

    const handleApplyFilter = useCallback((id) => {
        navigate(`/reports/filters/${id}/apply`);
    }, [navigate]);

    if (loading && !filters.length) {
        return <ReportLoading variant="skeleton" text="Loading filters..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load filters"
            />
        );
    }

    return (
        <div className="filter-list-container">
            <div className="filter-list-header">
                <div className="header-left">
                    <h1 className="page-title">Saved Filters</h1>
                    <span className="filter-count">{total} filters</span>
                </div>
                <div className="header-right">
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <FiPlus size={18} />
                        Create Filter
                    </button>
                </div>
            </div>

            <div className="filter-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search filters..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filtersState.filter_type || ''}
                            onChange={(e) => handleFilterChange('filter_type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="date_range">Date Range</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="multi_select">Multi-Select</option>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="hierarchy">Hierarchical</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Scope</label>
                        <select
                            value={filtersState.is_global ?? ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleFilterChange('is_global', val === '' ? null : val === 'true');
                            }}
                            className="filter-select"
                        >
                            <option value="">All</option>
                            <option value="true">Global</option>
                            <option value="false">Personal</option>
                        </select>
                    </div>
                    {(filtersState.filter_type || filtersState.is_global !== null || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            <FiFilter size={14} />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {filters.length === 0 ? (
                <ReportEmptyState
                    title="No Filters Found"
                    description="Create saved filters to quickly apply common filtering patterns to your reports."
                    icon={<MdOutlineFilterList size={48} />}
                    actionText="Create Filter"
                    onAction={handleCreate}
                />
            ) : (
                <>
                    <FilterTable
                        filters={filters}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                        onDuplicate={handleDuplicate}
                        onApply={handleApplyFilter}
                    />
                    <ReportPagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </>
            )}

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Filter"
                message={`Are you sure you want to delete the filter "${filterToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setFilterToDelete(null);
                }}
            />
        </div>
    );
};
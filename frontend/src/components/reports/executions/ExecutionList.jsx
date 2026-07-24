// frontend/src/components/reports/executions/ExecutionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiClock } from 'react-icons/fi';
import { MdOutlineHistory } from 'react-icons/md';
import { useExecutions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
} from '../common';
import { ExecutionTable } from './ExecutionTable';
import { ExecutionFilters } from './ExecutionFilters';
import './executions.css';

export const ExecutionList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const {
        executions,
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
    } = useExecutions({
        autoFetch: true,
        filters: { status: null, report: null, triggered_by: null },
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
        navigate(`/reports/executions/${id}`);
    }, [navigate]);

    const handleRefresh = useCallback(() => {
        fetchList();
    }, [fetchList]);

    if (loading && !executions.length) {
        return <ReportLoading variant="skeleton" text="Loading executions..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load executions"
            />
        );
    }

    return (
        <div className="execution-list-container">
            <div className="execution-list-header">
                <div className="header-left">
                    <h1 className="page-title">Executions</h1>
                    <span className="execution-count">{total} executions</span>
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
                </div>
            </div>

            <div className="execution-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search executions..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.status || filters.report || filters.triggered_by || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <ExecutionFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {executions.length === 0 ? (
                <ReportEmptyState
                    title="No Executions Found"
                    description="Executions will appear here when reports are generated."
                    icon={<MdOutlineHistory size={48} />}
                />
            ) : (
                <ExecutionTable
                    executions={executions}
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
        </div>
    );
};
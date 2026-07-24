// frontend/src/components/reports/audits/AuditList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiBarChart2 } from 'react-icons/fi';
import { MdOutlineHistory } from 'react-icons/md';
import { useAudits } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
} from '../common';
import { AuditTable } from './AuditTable';
import { AuditFilters } from './AuditFilters';
import { AuditStats } from './AuditStats';
import './audits.css';

export const AuditList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(false);

    const {
        audits,
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
        fetchStats,
        stats,
    } = useAudits({
        autoFetch: true,
        autoFetchStats: true,
        filters: { action: null, report: null, user: null, success: null, ip_address: null },
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
        navigate(`/reports/audits/${id}`);
    }, [navigate]);

    const handleRefresh = useCallback(() => {
        fetchList();
        fetchStats();
    }, [fetchList, fetchStats]);

    const toggleStats = useCallback(() => {
        setShowStats(!showStats);
        if (!showStats && !stats) {
            fetchStats();
        }
    }, [showStats, stats, fetchStats]);

    if (loading && !audits.length) {
        return <ReportLoading variant="skeleton" text="Loading audit logs..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load audit logs"
            />
        );
    }

    return (
        <div className="audit-list-container">
            <div className="audit-list-header">
                <div className="header-left">
                    <h1 className="page-title">Audit Logs</h1>
                    <span className="audit-count">{total} records</span>
                </div>
                <div className="header-right">
                    <button
                        className={`btn btn-outline ${showStats ? 'active' : ''}`}
                        onClick={toggleStats}
                    >
                        <FiBarChart2 size={16} />
                        Stats
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
                </div>
            </div>

            <div className="audit-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search audit logs..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.action || filters.report || filters.user || filters.success !== null || filters.ip_address || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <AuditFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {showStats && stats && (
                <AuditStats stats={stats} />
            )}

            {audits.length === 0 ? (
                <ReportEmptyState
                    title="No Audit Logs Found"
                    description="Audit logs will appear here when users interact with reports."
                    icon={<MdOutlineHistory size={48} />}
                />
            ) : (
                <AuditTable
                    audits={audits}
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
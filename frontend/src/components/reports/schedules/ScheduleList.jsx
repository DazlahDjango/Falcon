// frontend/src/components/reports/schedules/ScheduleList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiGrid, FiList, FiRefreshCw, FiFilter, FiClock } from 'react-icons/fi';
import { MdOutlineSchedule } from 'react-icons/md';
import { useSchedules } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../common';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleFilters } from './ScheduleFilters';
import './schedules.css';

export const ScheduleList = () => {
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);

    const {
        schedules,
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
        fetchDue,
        dueSchedules,
        fetchOverdue,
        overdueSchedules,
    } = useSchedules({
        autoFetch: true,
        filters: { frequency: null, status: null, is_active: null },
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
        navigate(`/reports/schedules/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/reports/schedules/${id}/edit`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/reports/schedules/create');
    }, [navigate]);

    const handleDelete = useCallback((schedule) => {
        setScheduleToDelete(schedule);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (scheduleToDelete) {
            await remove(scheduleToDelete.id);
            setShowDeleteConfirm(false);
            setScheduleToDelete(null);
            fetchList();
        }
    }, [scheduleToDelete, remove, fetchList]);

    const handleRefresh = useCallback(() => {
        fetchList();
        fetchDue();
        fetchOverdue();
    }, [fetchList, fetchDue, fetchOverdue]);

    const handleRunNow = useCallback((id) => {
        navigate(`/reports/schedules/${id}/run`);
    }, [navigate]);

    if (loading && !schedules.length) {
        return <ReportLoading variant="skeleton" text="Loading schedules..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchList();
                }}
                title="Failed to load schedules"
            />
        );
    }

    return (
        <div className="schedule-list-container">
            <div className="schedule-list-header">
                <div className="header-left">
                    <h1 className="page-title">Schedules</h1>
                    <span className="schedule-count">{total} schedules</span>
                    {dueSchedules.length > 0 && (
                        <span className="due-badge">
                            <FiClock size={14} />
                            {dueSchedules.length} due
                        </span>
                    )}
                    {overdueSchedules.length > 0 && (
                        <span className="overdue-badge">
                            ⚠️ {overdueSchedules.length} overdue
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
                    {permissions.canCreateSchedule && (
                        <button className="btn btn-primary" onClick={handleCreate}>
                            <FiPlus size={18} />
                            Create Schedule
                        </button>
                    )}
                </div>
            </div>

            <div className="schedule-list-controls">
                <div className="controls-left">
                    <ReportSearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearch={handleSearch}
                        placeholder="Search schedules..."
                        debounceDelay={300}
                    />
                </div>
                <div className="controls-right">
                    {(filters.frequency || filters.status || filters.is_active !== null || searchTerm) && (
                        <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <ScheduleFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}

            {schedules.length === 0 ? (
                <ReportEmptyState
                    title="No Schedules Found"
                    description="Create schedules to automate report generation and delivery."
                    icon={<MdOutlineSchedule size={48} />}
                    actionText="Create Schedule"
                    onAction={permissions.canCreateSchedule ? handleCreate : undefined}
                />
            ) : viewMode === 'grid' ? (
                <div className="schedule-grid">
                    {schedules.map((schedule) => (
                        <ScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRunNow={handleRunNow}
                        />
                    ))}
                </div>
            ) : (
                <ScheduleTable
                    schedules={schedules}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRunNow={handleRunNow}
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
                title="Delete Schedule"
                message={`Are you sure you want to delete the schedule "${scheduleToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setScheduleToDelete(null);
                }}
            />
        </div>
    );
};
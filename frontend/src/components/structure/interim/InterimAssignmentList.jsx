import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUser, FiClock } from 'react-icons/fi';
import { useInterimAssignments } from '../../../hooks/structure';
import {
  StructureTable,
  StructureSearchBar,
  StructureFilters,
  StructurePagination,
  StructureStatusBadge,
  StructureLoading,
  StructureEmptyState,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { STRUCTURE_MESSAGES } from '../../../config/constants/structureConstants';
import './interim.css';

const COLUMNS = [
  {
    key: 'employee_user_id',
    header: 'Employee',
    width: '160px',
    render: (item) => (
      <div className="interim-person-cell">
        <FiUser size={14} className="person-icon" />
        <span>{item.employee_user_id || item.employee_id}</span>
      </div>
    ),
  },
  {
    key: 'interim_manager_user_id',
    header: 'Interim Manager',
    width: '160px',
    render: (item) => (
      <div className="interim-person-cell">
        <FiUser size={14} className="person-icon manager-icon" />
        <span>{item.interim_manager_user_id || item.interim_manager_id}</span>
      </div>
    ),
  },
  {
    key: 'reporting_type',
    header: 'Type',
    width: '120px',
    render: (item) => (
      <span className={`reporting-type-badge type-${item.reporting_type || 'interim'}`}>
        {item.reporting_type || 'interim'}
      </span>
    ),
  },
  {
    key: 'effective_from',
    header: 'From',
    width: '120px',
    render: (item) => item.effective_from ? new Date(item.effective_from).toLocaleDateString() : '-',
  },
  {
    key: 'effective_to',
    header: 'To',
    width: '120px',
    render: (item) => item.effective_to ? new Date(item.effective_to).toLocaleDateString() : '-',
  },
  {
    key: 'days_remaining',
    header: 'Days Left',
    width: '100px',
    render: (item) => (
      <span className={`days-remaining ${item.days_remaining <= 7 ? 'urgent' : ''}`}>
        <FiClock size={12} />
        {item.days_remaining || 0}
      </span>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    width: '100px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_active ? 'active' : 'inactive'}
        customLabel={item.is_active ? 'Active' : 'Inactive'}
        size="sm"
      />
    ),
  },
];

export const InterimAssignmentList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    items,
    isLoading,
    error,
    totalCount,
    fetchAll,
    remove,
    clearError,
  } = useInterimAssignments({ autoFetch: false });

  useEffect(() => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, page, pageSize, searchTerm, filters]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleView = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_EDIT(item.id));
  }, [navigate]);

  const handleDeleteClick = useCallback((item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      const params = {
        page,
        page_size: pageSize,
        search: searchTerm,
        ...filters,
      };
      fetchAll(params);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [deleteTarget, remove, fetchAll, page, pageSize, searchTerm, filters]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_CREATE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    };
    fetchAll(params);
  }, [fetchAll, page, pageSize, searchTerm, filters]);

  if (error) {
    return (
      <div className="interim-list-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const paginationProps = {
    currentPage: page,
    totalPages: Math.ceil(totalCount / pageSize),
    pageSize,
    totalItems: totalCount,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <div className="interim-list-container">
      <div className="interim-list-header">
        <div className="header-left">
          <h1>Interim Assignments</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleCreate} className="btn btn-primary">
            <FiPlus size={16} />
            New Interim Assignment
          </button>
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search interim assignments..."
      >
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_active || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_active: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Reporting Type</label>
          <select
            value={filters.reporting_type || ''}
            onChange={(e) => handleFilterChange({ ...filters, reporting_type: e.target.value })}
          >
            <option value="">All</option>
            <option value="interim">Interim</option>
            <option value="dotted">Dotted</option>
            <option value="functional">Functional</option>
            <option value="project">Project</option>
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by employee or manager ID..."
        debounce={400}
      />

      <StructureTable
        columns={COLUMNS}
        data={items}
        loading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        pagination={paginationProps}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Interim Assignments Found"
          description="Create an interim assignment to temporarily assign a manager to an employee."
          actionLabel="Create Interim Assignment"
          onAction={handleCreate}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Interim Assignment"
        message={`Are you sure you want to delete this interim assignment? This will remove the temporary reporting relationship. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default InterimAssignmentList;
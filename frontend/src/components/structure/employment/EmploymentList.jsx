import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUser, FiBriefcase } from 'react-icons/fi';
import { useEmployments, useStructurePermissions } from '../../../hooks/structure';
import {
  StructureTable,
  StructureSearchBar,
  StructureFilters,
  StructurePagination,
  StructureStatusBadge,
  StructureLoading,
  StructureEmptyState,
  StructureConfirmDialog,
  StructureSummaryCards,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import { STRUCTURE_MESSAGES } from '../../../config/constants/structureConstants';
import './employment.css';

const COLUMNS = [
  {
    key: 'user_name',
    header: 'Employee',
    width: '180px',
    render: (item) => (
      <div className="employee-cell">
        <FiUser size={14} className="employee-icon" />
        <span>{item.user_name || item.user_id}</span>
      </div>
    ),
  },
  {
    key: 'position_title',
    header: 'Position',
    width: '180px',
    render: (item) => item.position_title || '-',
  },
  {
    key: 'department_name',
    header: 'Department',
    width: '160px',
    render: (item) => item.department_name || '-',
  },
  {
    key: 'unit_name',
    header: 'Unit',
    width: '140px',
    render: (item) => item.unit_name || '-',
  },
  {
    key: 'employment_type',
    header: 'Type',
    width: '120px',
    render: (item) => (
      <span className={`employment-type-badge type-${item.employment_type}`}>
        {item.employment_type}
      </span>
    ),
  },
  {
    key: 'is_manager',
    header: 'Manager',
    width: '80px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_manager ? 'active' : 'inactive'}
        customLabel={item.is_manager ? 'Yes' : 'No'}
        size="sm"
      />
    ),
  },
  {
    key: 'is_current',
    header: 'Status',
    width: '100px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_current ? 'active' : 'inactive'}
        customLabel={item.is_current ? 'Current' : 'Inactive'}
        size="sm"
      />
    ),
  },
];

export const EmploymentList = () => {
  const navigate = useNavigate();
  const { permissions } = useStructurePermissions();
  const canManage = permissions?.canManageEmployments;
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
    stats,
    fetchAll,
    fetchStats,
    remove,
    clearError,
  } = useEmployments({ autoFetch: false });

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_EDIT(item.id));
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
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_CREATE);
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
      <div className="employment-list-error">
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
    <div className="employment-list-container">
      <div className="employment-list-header">
        <div className="header-left">
          <h1>Employments</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          {canManage && (
            <button onClick={handleCreate} className="btn btn-primary">
              <FiPlus size={16} />
              New Employment
            </button>
          )}
        </div>
      </div>

      <StructureSummaryCards
        loading={!stats && isLoading}
        items={[
          {
            title: 'Total Active Employments',
            value: stats?.total_current_employments || 0,
            variant: 'default',
            description: 'Current active staff'
          },
          {
            title: 'Managers',
            value: stats?.manager_count || 0,
            variant: 'success',
            description: 'Staff with approval rights'
          },
          {
            title: 'Executives',
            value: stats?.executive_count || 0,
            variant: 'warning',
            description: 'Top-level leadership'
          },
          {
            title: 'Management %',
            value: stats?.management_percentage || 0,
            suffix: '%',
            variant: 'default',
            description: 'Ratio of managers'
          }
        ]}
      />

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search employments..."
      >
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_current || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_current: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Current</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Employment Type</label>
          <select
            value={filters.employment_type || ''}
            onChange={(e) => handleFilterChange({ ...filters, employment_type: e.target.value })}
          >
            <option value="">All</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="probation">Probation</option>
            <option value="intern">Intern</option>
            <option value="consultant">Consultant</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Manager</label>
          <select
            value={filters.is_manager || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_manager: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Managers</option>
            <option value="false">Non-Managers</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Executive</label>
          <select
            value={filters.is_executive || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_executive: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Executives</option>
            <option value="false">Non-Executives</option>
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by user name or position..."
        debounce={400}
      />

      <StructureTable hideEmptyState={true}
        columns={COLUMNS}
        data={items}
        loading={isLoading}
        onView={handleView}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDeleteClick : undefined}
        pagination={paginationProps}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Employments Found"
          description="Create your first employment to assign employees to positions."
          actionLabel={canManage ? "Create Employment" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Employment"
        message={`Are you sure you want to delete this employment for "${deleteTarget?.user_name}"? This will remove the employee from their position. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default EmploymentList;

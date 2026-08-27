import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiMove, FiFolder, FiList } from 'react-icons/fi';
import { useDepartments, useStructurePermissions } from '../../../hooks/structure';
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
import './department.css';

export const DepartmentList = () => {
  const navigate = useNavigate();
  const { permissions } = useStructurePermissions();
  const canManage = permissions?.canManageDepartments;
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
    update,
    remove,
    clearError,
  } = useDepartments({ autoFetch: false });

  const handleToggleActive = useCallback(async (item, e) => {
    e.stopPropagation();
    try {
      await update(item.id, { is_active: !item.is_active });
      const params = {
        page,
        page_size: pageSize,
        search: searchTerm,
        ...filters,
      };
      fetchAll(params);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  }, [update, fetchAll, page, pageSize, searchTerm, filters]);

  const COLUMNS = useMemo(() => [
    { key: 'code', header: 'Code', width: '120px' },
    { key: 'name', header: 'Name', width: '200px' },
    {
      key: 'parent_name',
      header: 'Parent',
      width: '160px',
      render: (item) => item.parent_name || '-',
    },
    {
      key: 'depth',
      header: 'Depth',
      width: '70px',
      render: (item) => item.depth || 0,
    },
    {
      key: 'headcount_limit',
      header: 'Headcount',
      width: '100px',
      render: (item) => item.headcount_limit || '-',
    },
    {
      key: 'sensitivity_level',
      header: 'Sensitivity',
      width: '120px',
      render: (item) => (
        <span className={`sensitivity-badge sensitivity-${item.sensitivity_level || 'internal'}`}>
          {item.sensitivity_level || 'internal'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '100px',
      render: (item) => (
        <div
          onClick={(e) => handleToggleActive(item, e)}
          style={{ cursor: 'pointer', display: 'inline-block' }}
          title={item.is_active ? "Click to deactivate" : "Click to activate"}
        >
          <StructureStatusBadge status={item.is_active ? 'active' : 'inactive'} size="sm" />
        </div>
      ),
    },
  ], [handleToggleActive]);

  const handleView = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(item.id));
  }, [navigate]);

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

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_EDIT(item.id));
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
    navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE);
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
      <div className="department-list-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
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
    <div className="department-list-container">
      <div className="department-list-header">
        <div className="header-left">
          <h1>Departments</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_TREE)}
            className="btn btn-secondary"
            title="View Hierarchy Tree"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FiFolder size={16} />
            Tree View
          </button>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          {canManage && (
            <button onClick={handleCreate} className="btn btn-primary">
              <FiPlus size={16} />
              New Department
            </button>
          )}
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search departments..."
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
          <label>Sensitivity</label>
          <select
            value={filters.sensitivity_level || ''}
            onChange={(e) => handleFilterChange({ ...filters, sensitivity_level: e.target.value })}
          >
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by code or name..."
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
          title="No Departments Found"
          description="Create your first department to start organizing your structure."
          actionLabel={canManage ? "Create Department" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all associated sections, units, and positions. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default DepartmentList;

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiLayers, FiUsers, FiActivity } from 'react-icons/fi';
import { useDivisions, useStructurePermissions } from '../../../hooks/structure';
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
import './division.css';

export const DivisionList = () => {
  const navigate = useNavigate();
  const { permissions } = useStructurePermissions();
  const canManage = permissions?.canManageDepartments || permissions?.isClientAdmin;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Memoize params to prevent infinite re-renders
  const params = useMemo(() => ({
    page,
    page_size: pageSize,
    search: searchTerm,
    ...filters,
  }), [page, pageSize, searchTerm, filters]);

  const {
    items,
    isLoading,
    error,
    totalCount,
    fetchAll,
    update,
    remove,
    clearError,
    refetch,
  } = useDivisions({ autoFetch: false });

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
    { key: 'description', header: 'Description' },
    {
      key: 'level',
      header: 'Level',
      width: '100px',
      render: (item) => item.level || 'Division',
    },
    {
      key: 'depth',
      header: 'Depth',
      width: '80px',
      render: (item) => item.depth || 0,
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      render: (item) => (
        <div
          onClick={(e) => handleToggleActive(item, e)}
          style={{ cursor: 'pointer', display: 'inline-block' }}
          title={item.is_active ? "Click to deactivate" : "Click to activate"}
        >
          <StructureStatusBadge status={item.is_active ? 'active' : 'inactive'} />
        </div>
      ),
    },
  ], [handleToggleActive]);

  useEffect(() => {
    if (params) {
      fetchAll(params);
    }
  }, [fetchAll, params]);

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
    navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.DIVISION_EDIT(item.id));
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
      // Refetch with current params after deletion
      refetch({
        page,
        page_size: pageSize,
        search: searchTerm,
        ...filters,
      });
    } catch (err) {
      console.error('Delete failed:', err);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, remove, refetch, page, pageSize, searchTerm, filters]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DIVISION_CREATE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refetch({
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    });
  }, [refetch, page, pageSize, searchTerm, filters]);

  const summaryStats = useMemo(() => {
    const itemsArray = Array.isArray(items) ? items : [];
    const activeCount = itemsArray.filter((item) => item.is_active).length;
    const inactiveCount = itemsArray.filter((item) => !item.is_active).length;
    const withHeadcount = itemsArray.filter((item) => item.headcount_limit).length;

    return [
      { label: 'Total divisions', value: totalCount, icon: FiLayers },
      { label: 'Active', value: activeCount, icon: FiActivity },
      { label: 'With headcount', value: withHeadcount, icon: FiUsers },
      { label: 'Inactive', value: inactiveCount, icon: FiRefreshCw },
    ];
  }, [items, totalCount]);

  if (error) {
    const errorMessage = typeof error === 'string'
      ? error
      : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error));
    return (
      <div className="division-list-error">
        <p>{errorMessage}</p>
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
    <div className="division-list-container">
      <div className="division-list-hero">
        <div className="division-list-hero__content">
          <div className="division-list-hero__icon">
            <FiLayers size={22} />
          </div>
          <div>
            <p className="division-list-hero__eyebrow">Structure management</p>
            <h2>Division overview</h2>
            <p>Keep major business units consistent with clear naming, active status, and headcount planning.</p>
          </div>
        </div>
        <div className="division-list-hero__stats">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="division-stat-card">
                <div className="division-stat-card__icon">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="division-stat-card__value">{stat.value}</div>
                  <div className="division-stat-card__label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="division-list-header">
        <div className="header-left">
          <h1>Divisions</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          {canManage && (
            <button onClick={handleCreate} className="btn btn-primary">
              <FiPlus size={16} />
              New Division
            </button>
          )}
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search divisions..."
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
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by code or name..."
        debounce={400}
      />

      <StructureTable
        columns={COLUMNS}
        data={items}
        loading={isLoading}
        onView={handleView}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDeleteClick : undefined}
        pagination={paginationProps}
        hideEmptyState={true}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Divisions Found"
          description="Create your first division to start organizing your structure."
          actionLabel={canManage ? "Create Division" : undefined}
          onAction={canManage ? handleCreate : undefined}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Division"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default DivisionList;

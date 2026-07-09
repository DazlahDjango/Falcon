import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { useCostCenters } from '../../../hooks/structure';
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
import './costcenter.css';

const COLUMNS = [
  { key: 'code', header: 'Code', width: '120px' },
  { key: 'name', header: 'Name', width: '200px' },
  {
    key: 'category',
    header: 'Category',
    width: '140px',
    render: (item) => (
      <span className={`category-badge category-${item.category}`}>
        {item.category || 'operational'}
      </span>
    ),
  },
  {
    key: 'fiscal_year',
    header: 'Fiscal Year',
    width: '100px',
    render: (item) => item.fiscal_year || '-',
  },
  {
    key: 'budget_amount',
    header: 'Budget',
    width: '140px',
    render: (item) => (
      <span className="budget-amount">
        {item.budget_amount ? `$${Number(item.budget_amount).toLocaleString()}` : '-'}
      </span>
    ),
  },
  {
    key: 'organizational_unit_name',
    header: 'Org Unit',
    width: '160px',
    render: (item) => item.organizational_unit_name || '-',
  },
  {
    key: 'is_active',
    header: 'Status',
    width: '100px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_active ? 'active' : 'inactive'}
        size="sm"
      />
    ),
  },
];

export const CostCenterList = () => {
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
  } = useCostCenters({ autoFetch: false });

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
    navigate(STRUCTURE_ROUTES.COST_CENTER_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.COST_CENTER_EDIT(item.id));
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
    navigate(STRUCTURE_ROUTES.COST_CENTER_CREATE);
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
      <div className="costcenter-list-error">
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
    <div className="costcenter-list-container">
      <div className="costcenter-list-header">
        <div className="header-left">
          <h1>Cost Centers</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleCreate} className="btn btn-primary">
            <FiPlus size={16} />
            New Cost Center
          </button>
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search cost centers..."
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
          <label>Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="">All</option>
            <option value="operational">Operational</option>
            <option value="capital">Capital</option>
            <option value="project">Project</option>
            <option value="departmental">Departmental</option>
            <option value="shared">Shared Service</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Shared</label>
          <select
            value={filters.is_shared || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_shared: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Shared</option>
            <option value="false">Not Shared</option>
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
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        pagination={paginationProps}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Cost Centers Found"
          description="Create your first cost center to start tracking financial allocations."
          actionLabel="Create Cost Center"
          onAction={handleCreate}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Cost Center"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove the cost center and all associated financial data. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default CostCenterList;

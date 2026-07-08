import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { usePositions } from '../../../hooks/structure';
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
import './position.css';

const COLUMNS = [
  { key: 'job_code', header: 'Job Code', width: '130px' },
  { key: 'title', header: 'Title', width: '220px' },
  {
    key: 'grade',
    header: 'Grade',
    width: '80px',
    render: (item) => item.grade || '-',
  },
  {
    key: 'level',
    header: 'Level',
    width: '70px',
    render: (item) => item.level || '-',
  },
  {
    key: 'current_incumbents_count',
    header: 'Incumbents',
    width: '100px',
    render: (item) => (
      <span className={`incumbent-count ${item.current_incumbents_count === 0 ? 'vacant' : ''}`}>
        <FiUsers size={14} />
        {item.current_incumbents_count || 0}
        {item.max_incumbents && ` / ${item.max_incumbents}`}
      </span>
    ),
  },
  {
    key: 'is_vacant',
    header: 'Status',
    width: '120px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_vacant ? 'inactive' : 'active'}
        customLabel={item.is_vacant ? 'Vacant' : 'Occupied'}
      />
    ),
  },
];

export const PositionList = () => {
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
  } = usePositions({ autoFetch: false });

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
    navigate(STRUCTURE_ROUTES.POSITION_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.POSITION_EDIT(item.id));
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
    navigate(STRUCTURE_ROUTES.POSITION_CREATE);
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
      <div className="position-list-error">
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
    <div className="position-list-container">
      <div className="position-list-header">
        <div className="header-left">
          <h1>Positions</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleCreate} className="btn btn-primary">
            <FiPlus size={16} />
            New Position
          </button>
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search positions..."
      >
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.is_vacant || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_vacant: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Vacant</option>
            <option value="false">Occupied</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Grade</label>
          <input
            type="text"
            placeholder="Filter by grade"
            value={filters.grade || ''}
            onChange={(e) => handleFilterChange({ ...filters, grade: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Level Range</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.level_min || ''}
              onChange={(e) => handleFilterChange({ ...filters, level_min: e.target.value })}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.level_max || ''}
              onChange={(e) => handleFilterChange({ ...filters, level_max: e.target.value })}
            />
          </div>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by job code or title..."
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
          title="No Positions Found"
          description="Create your first position to start defining roles in your organization."
          actionLabel="Create Position"
          onAction={handleCreate}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Position"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will remove the position and all associated employments. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default PositionList;
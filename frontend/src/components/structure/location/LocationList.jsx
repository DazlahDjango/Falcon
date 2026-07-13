import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiMapPin, FiGlobe } from 'react-icons/fi';
import { useLocations } from '../../../hooks/structure';
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
import './location.css';

export const LocationList = () => {
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
    update,
    remove,
    clearError,
  } = useLocations({ autoFetch: false });

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
      key: 'type',
      header: 'Type',
      width: '140px',
      render: (item) => (
        <span className={`location-type-badge type-${item.type}`}>
          {item.type || 'branch'}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      width: '140px',
      render: (item) => item.city || '-',
    },
    {
      key: 'country',
      header: 'Country',
      width: '140px',
      render: (item) => (
        <span className="country-cell">
          <FiGlobe size={14} className="country-icon" />
          {item.country || '-'}
        </span>
      ),
    },
    {
      key: 'is_headquarters',
      header: 'HQ',
      width: '70px',
      render: (item) => (
        <StructureStatusBadge
          status={item.is_headquarters ? 'active' : 'inactive'}
          customLabel={item.is_headquarters ? 'Yes' : 'No'}
          size="sm"
        />
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
          <StructureStatusBadge
            status={item.is_active ? 'active' : 'inactive'}
            size="sm"
          />
        </div>
      ),
    },
  ], [handleToggleActive]);

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
    navigate(STRUCTURE_ROUTES.LOCATION_DETAIL(item.id));
  }, [navigate]);

  const handleEdit = useCallback((item) => {
    navigate(STRUCTURE_ROUTES.LOCATION_EDIT(item.id));
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
    navigate(STRUCTURE_ROUTES.LOCATION_CREATE);
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
      <div className="location-list-error">
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
    <div className="location-list-container">
      <div className="location-list-header">
        <div className="header-left">
          <h1>Locations</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleCreate} className="btn btn-primary">
            <FiPlus size={16} />
            New Location
          </button>
        </div>
      </div>

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search locations..."
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
          <label>Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value })}
          >
            <option value="">All</option>
            <option value="headquarters">Headquarters</option>
            <option value="regional">Regional</option>
            <option value="branch">Branch</option>
            <option value="remote">Remote</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Country</label>
          <input
            type="text"
            placeholder="Filter by country"
            value={filters.country || ''}
            onChange={(e) => handleFilterChange({ ...filters, country: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Headquarters</label>
          <select
            value={filters.is_headquarters || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_headquarters: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Headquarters</option>
            <option value="false">Non-HQ</option>
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by code, name, city or country..."
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
          title="No Locations Found"
          description="Create your first location to define where your organization operates."
          actionLabel="Create Location"
          onAction={handleCreate}
        />
      )}

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove the location and all associated data. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default LocationList;

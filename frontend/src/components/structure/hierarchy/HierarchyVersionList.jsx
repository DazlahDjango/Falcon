import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiRefreshCw, FiClock, FiGitBranch, FiUsers, FiLayers } from 'react-icons/fi';
import { useHierarchy } from '../../../hooks/structure';
import {
  StructureTable,
  StructureSearchBar,
  StructureFilters,
  StructurePagination,
  StructureStatusBadge,
  StructureLoading,
  StructureEmptyState,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

const COLUMNS = [
  {
    key: 'version_number',
    header: 'Version',
    width: '100px',
    render: (item) => (
      <span className="version-number-badge">v{item.version_number}</span>
    ),
  },
  { key: 'name', header: 'Name', width: '200px' },
  { key: 'description', header: 'Description' },
  {
    key: 'version_type',
    header: 'Type',
    width: '130px',
    render: (item) => (
      <span className={`version-type-badge type-${item.version_type}`}>
        {item.version_type || 'manual'}
      </span>
    ),
  },
  {
    key: 'effective_from',
    header: 'Effective From',
    width: '130px',
    render: (item) => item.effective_from ? new Date(item.effective_from).toLocaleDateString() : '-',
  },
  {
    key: 'is_current',
    header: 'Current',
    width: '80px',
    render: (item) => (
      <StructureStatusBadge
        status={item.is_current ? 'active' : 'inactive'}
        customLabel={item.is_current ? 'Yes' : 'No'}
        size="sm"
      />
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    width: '130px',
    render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
  },
];

export const HierarchyVersionList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);

  const {
    items,
    isLoading,
    error,
    totalCount,
    fetchAll,
    clearError,
  } = useHierarchy({ autoFetch: false });

  useEffect(() => {
    loadData();
  }, [fetchAll, page, pageSize, searchTerm, filters]);

  const loadData = useCallback(async () => {
    const params = {
      page,
      page_size: pageSize,
      search: searchTerm,
      ...filters,
    };
    await fetchAll(params);
    // Hierarchy version stats are not available on backend yet
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
    navigate(STRUCTURE_ROUTES.HIERARCHY_DETAIL(item.id));
  }, [navigate]);

  const handleCapture = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY_CAPTURE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="hierarchy-list-error">
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
    <div className="hierarchy-list-container">
      <div className="hierarchy-list-header">
        <div className="header-left">
          <h1>Hierarchy Versions</h1>
          <span className="header-count">{totalCount} total</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleCapture} className="btn btn-primary">
            <FiPlus size={16} />
            Capture Snapshot
          </button>
        </div>
      </div>

      {stats && (
        <div className="hierarchy-stats-bar">
          <div className="stat-item">
            <FiGitBranch size={16} />
            <span>Total Versions: {stats.total_versions || 0}</span>
          </div>
          <div className="stat-item">
            <FiClock size={16} />
            <span>Current Version: v{stats.current_version || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <FiLayers size={16} />
            <span>Snapshots: {stats.snapshot_count || 0}</span>
          </div>
          <div className="stat-item">
            <FiUsers size={16} />
            <span>Changes: {stats.total_changes || 0}</span>
          </div>
        </div>
      )}

      <StructureFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search hierarchy versions..."
      >
        <div className="filter-group">
          <label>Version Type</label>
          <select
            value={filters.version_type || ''}
            onChange={(e) => handleFilterChange({ ...filters, version_type: e.target.value })}
          >
            <option value="">All</option>
            <option value="auto">Auto-saved</option>
            <option value="manual">Manual Snapshot</option>
            <option value="restructure">Reorganization</option>
            <option value="yearly">Yearly Archive</option>
            <option value="acquisition">Merger/Acquisition</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Current</label>
          <select
            value={filters.is_current || ''}
            onChange={(e) => handleFilterChange({ ...filters, is_current: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Current</option>
            <option value="false">Archived</option>
          </select>
        </div>
      </StructureFilters>

      <StructureSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by name or description..."
        debounce={400}
      />

      <StructureTable hideEmptyState={true}
        columns={COLUMNS}
        data={items}
        loading={isLoading}
        onView={handleView}
        pagination={paginationProps}
        actions={false}
      />

      {!isLoading && items.length === 0 && (
        <StructureEmptyState
          title="No Hierarchy Versions Found"
          description="Capture your first hierarchy snapshot to start tracking organizational changes."
          actionLabel="Capture Snapshot"
          onAction={handleCapture}
        />
      )}
    </div>
  );
};

export default HierarchyVersionList;

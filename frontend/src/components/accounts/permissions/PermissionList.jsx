import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiShield,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import { usePermissions } from '../../../hooks/accounts/usePermissions';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { PermissionTable } from './PermissionTable';
import { PermissionBadge } from './PermissionBadge';

export const PermissionList = () => {
  const {
    permissions,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    getPermissions,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    getCategoryMap,
    getCategories,
  } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    getPermissions({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
    });
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    pagination.goToPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    pagination.goToPage(1);
  };

  const handleRefresh = () => {
    getPermissions({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
    });
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const categories = getCategories();

  return (
    <div className="permission-list-container">
      <div className="permission-list-header">
        <div className="permission-list-title">
          <FiKey className="title-icon" />
          <h1>Permissions</h1>
          <span className="permission-count">{pagination.total} permissions</span>
        </div>
        <div className="permission-list-actions">
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="permission-list-toolbar">
        <div className="permission-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search permissions by name or codename..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="permission-list-toolbar-right">
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
            {Object.values(filters).some(v => v !== '' && v !== null) && (
              <span className="filter-count">•</span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="permission-filters-panel">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Level</label>
            <select
              className="filter-select"
              value={filters.level || ''}
              onChange={(e) => handleFilterChange({ level: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="global">Global</option>
              <option value="tenant">Tenant</option>
              <option value="department">Department</option>
              <option value="team">Team</option>
              <option value="self">Self</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.is_active == null ? '' : filters.is_active.toString()}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange({ is_active: val === '' ? null : val === 'true' });
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button
            className="filter-clear"
            onClick={() => {
              handleFilterChange({ category: '', level: '', is_active: null });
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {error && (
        <div className="permission-list-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && permissions.length === 0 ? (
        <div className="permission-list-loading">
          <div className="spinner" />
          <p>Loading permissions...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="permission-list-empty">
          <FiKey className="empty-icon" />
          <h3>No permissions found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <PermissionTable
            permissions={permissions}
            isLoading={isLoading}
          />

          <div className="permission-list-pagination">
            <div className="pagination-info">
              Showing {permissions.length} of {pagination.total} permissions
            </div>
            <div className="pagination-controls">
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="pagination-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <FiChevronLeft />
              </button>
              <span className="pagination-current">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PermissionList;

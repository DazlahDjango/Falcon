import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
} from 'react-icons/fi';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { RoleTable } from './RoleTable';
import { RoleForm } from './RoleForm';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const RoleList = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin } = useAuth();
  const {
    roles,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    getRoles,
    setFilters,
    setPage,
    setPageSize,
    clearError,
  } = useRoles();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    getRoles({
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
    getRoles({
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

  const canCreate = isSuperAdmin || isAdmin;

  return (
    <div className="role-list-container">
      <div className="role-list-header">
        <div className="role-list-title">
          <FiShield className="title-icon" />
          <h1>Roles</h1>
          <span className="role-count">{pagination.total} roles</span>
        </div>
        <div className="role-list-actions">
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create Role
            </button>
          )}
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="role-list-toolbar">
        <div className="role-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search roles by name or code..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="role-list-toolbar-right">
          <div className="role-filters">
            <select
              className="filter-select"
              value={filters.role_type || ''}
              onChange={(e) => handleFilterChange({ role_type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="system">System</option>
              <option value="custom">Custom</option>
            </select>
            <select
              className="filter-select"
              value={filters.is_assignable == null ? '' : filters.is_assignable.toString()}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange({ is_assignable: val === '' ? null : val === 'true' });
              }}
            >

              <option value="">All Assignable</option>
              <option value="true">Assignable</option>
              <option value="false">Not Assignable</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="role-list-error">
          <span>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && roles.length === 0 ? (
        <div className="role-list-loading">
          <div className="spinner" />
          <p>Loading roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="role-list-empty">
          <FiShield className="empty-icon" />
          <h3>No roles found</h3>
          <p>Try adjusting your search or filters</p>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create your first role
            </button>
          )}
        </div>
      ) : (
        <>
          <RoleTable
            roles={roles}
            isLoading={isLoading}
            onRowClick={(role) => navigate(ACCOUNTS_ROUTES.ROLE_DETAIL(role.id))}
          />

          <div className="role-list-pagination">
            <div className="pagination-info">
              Showing {roles.length} of {pagination.total} roles
            </div>
            <div className="pagination-controls">
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  pagination.changePageSize(newSize);
                  setPageSize(newSize);
                }}
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

      {showCreateModal && (
        <RoleForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};
export default RoleList;
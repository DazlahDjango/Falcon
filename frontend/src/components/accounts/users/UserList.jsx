import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiUserPlus,
  FiDownload,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { UserTable } from './UserTable';
import { UserCard } from './UserCard';
import { UserFilters } from './UserFilters';
import { UserInviteForm } from './UserInviteForm';
import { BulkUserImportModal, BulkExportButton } from '../bulk';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const UserList = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAuth();
  const {
    users,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    getUsers,
    setFilters,
    setPage,
    setPageSize,
    clearError,
  } = useUsers();

  const [viewMode, setViewMode] = useState('table');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = async () => {
    try {
      toast.loading('Exporting users...', { id: 'export-toast' });
      await exportUsers();
      toast.success('Users exported successfully!', { id: 'export-toast' });
    } catch (err) {
      toast.error('Failed to export users', { id: 'export-toast' });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('Importing users...', { id: 'import-toast' });
      const result = await importUsers(formData);
      toast.success('Users imported successfully!', { id: 'import-toast' });
      handleRefresh();
    } catch (err) {
      toast.error(err || 'Failed to import users', { id: 'import-toast' });
    } finally {
      e.target.value = '';
    }
  };

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    getUsers({
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
    getUsers({
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

  const canInvite = isAdmin() || isSuperAdmin;

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <div className="user-list-title">
          <FiUsers className="title-icon" />
          <h1>Users</h1>
          <span className="user-count">{pagination.total} users</span>
        </div>
        <div className="user-list-actions">
          {canInvite && (
            <>
              <button
                className="btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                <FiUserPlus /> Invite User
              </button>
              <button
                className="btn-secondary flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300"
                onClick={() => setShowBulkImportModal(true)}
              >
                <FiPlus /> Import CSV
              </button>
              <BulkExportButton />
            </>
          )}
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="user-list-toolbar">
        <div className="user-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="user-list-toolbar-right">
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <FiList />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <FiGrid />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="user-list-error">
          <span>{typeof error === 'string' ? error : error?.displayMessage || error?.message || 'An error occurred'}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && users.length === 0 ? (
        <div className="user-list-loading">
          <div className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="user-list-empty">
          <FiUsers className="empty-icon" />
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
          {canInvite && (
            <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
              <FiUserPlus /> Invite your first user
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <UserTable
              users={users}
              isLoading={isLoading}
              onRowClick={(user) => navigate(ACCOUNTS_ROUTES.USER_DETAIL(user.id))}
            />
          ) : (
            <div className="user-grid">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => navigate(ACCOUNTS_ROUTES.USER_DETAIL(user.id))}
                />
              ))}
            </div>
          )}

          <div className="user-list-pagination">
            <div className="pagination-info">
              Showing {users.length} of {pagination.total} users
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

      {showInviteModal && (
        <UserInviteForm
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            handleRefresh();
          }}
        />
      )}

      <BulkUserImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
};
export default UserList;
import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiLogOut,
  FiTrash2,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { SessionTable } from './SessionTable';
import { SessionCard } from './SessionCard';
import { BlacklistManager } from './BlacklistManager';

export const SessionList = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const {
    sessions,
    activeSessions,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    getSessions,
    getActive,
    terminateAllSessions,
    setFilters,
    setPage,
    setPageSize,
    clearError,
  } = useSessions();

  const [viewMode, setViewMode] = useState('table');
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [showTerminateAllConfirm, setShowTerminateAllConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadSessions();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadSessions = () => {
    getSessions({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
    });
  };

  const loadActive = () => {
    getActive();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    pagination.goToPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    pagination.goToPage(1);
  };

  const handleRefresh = () => {
    loadSessions();
    loadActive();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const handleTerminateAll = async () => {
    setActionLoading(true);
    try {
      await terminateAllSessions();
      setShowTerminateAllConfirm(false);
      handleRefresh();
    } catch (err) {
      console.error('Failed to terminate all sessions:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const canManage = isAdmin() || isSuperAdmin;

  return (
    <div className="session-list-container">
      <div className="session-list-header">
        <div className="session-list-title">
          <FiClock className="title-icon" />
          <h1>Sessions</h1>
          <span className="session-count">{pagination.total} sessions</span>
        </div>
        <div className="session-list-actions">
          {canManage && (
            <>
              <button
                className="btn-secondary"
                onClick={() => setShowBlacklist(!showBlacklist)}
              >
                <FiTrash2 /> {showBlacklist ? 'Hide Blacklist' : 'Blacklist'}
              </button>
              <button
                className="btn-danger"
                onClick={() => setShowTerminateAllConfirm(true)}
              >
                <FiLogOut /> Terminate All
              </button>
            </>
          )}
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="session-list-stats">
        <div className="stat-item">
          <span className="stat-label">Active Sessions</span>
          <span className="stat-value">{activeSessions.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{pagination.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Session</span>
          <span className="stat-value">
            {activeSessions.find(s => s.is_current) ? 'Active' : 'None'}
          </span>
        </div>
      </div>

      <div className="session-list-toolbar">
        <div className="session-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search sessions by IP, device, or user..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="session-list-toolbar-right">
          <div className="session-filters">
            <select
              className="filter-select"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
            <select
              className="filter-select"
              value={filters.device_type || ''}
              onChange={(e) => handleFilterChange({ device_type: e.target.value })}
            >
              <option value="">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              Table
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="session-list-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {showBlacklist && canManage && (
        <div className="session-blacklist-section">
          <BlacklistManager />
        </div>
      )}

      {isLoading && sessions.length === 0 ? (
        <div className="session-list-loading">
          <div className="spinner" />
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="session-list-empty">
          <FiClock className="empty-icon" />
          <h3>No sessions found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <SessionTable
              sessions={sessions}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          ) : (
            <div className="session-grid">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}

          <div className="session-list-pagination">
            <div className="pagination-info">
              Showing {sessions.length} of {pagination.total} sessions
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

      {showTerminateAllConfirm && (
        <div className="modal-overlay" onClick={() => setShowTerminateAllConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terminate All Sessions</h3>
              <button className="modal-close" onClick={() => setShowTerminateAllConfirm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <FiAlertTriangle className="warning-icon" />
              <p>Are you sure you want to terminate all active sessions?</p>
              <p className="text-muted">This will log out all users from all devices.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowTerminateAllConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleTerminateAll} disabled={actionLoading}>
                {actionLoading ? 'Terminating...' : 'Yes, Terminate All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SessionList;
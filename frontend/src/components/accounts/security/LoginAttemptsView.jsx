import React, { useState, useEffect } from 'react';
import {
  FiLogIn,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiMapPin,
} from 'react-icons/fi';
import { useSecurity } from '../../../hooks/accounts/useSecurity';
import { usePagination } from '../../../hooks/accounts/usePagination';

export const LoginAttemptsView = () => {
  const {
    getLoginAttempts,
    loginAttempts,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    setFilters,
    setPage,
    setPageSize,
    clearError,
  } = useSecurity();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadAttempts();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadAttempts = () => {
    getLoginAttempts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      identifier: searchTerm || filters.identifier,
    });
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
    loadAttempts();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getResultBadge = (result) => {
    const badges = {
      success: <span className="result-badge success"><FiCheckCircle /> Success</span>,
      failure: <span className="result-badge failure"><FiXCircle /> Failure</span>,
      locked: <span className="result-badge locked"><FiAlertCircle /> Locked</span>,
    };
    return badges[result] || <span className="result-badge default">{result}</span>;
  };

  const getFailureReason = (reason) => {
    const reasons = {
      wrong_password: 'Wrong Password',
      inactive: 'Account Inactive',
      locked: 'Account Locked',
      rate_limit: 'Rate Limit Exceeded',
      mfa_required: 'MFA Required',
      invalid_mfa: 'Invalid MFA',
      unknown: 'Unknown',
    };
    return reasons[reason] || reason || '-';
  };

  return (
    <div className="login-attempts-container">
      <div className="login-attempts-header">
        <div className="login-attempts-title">
          <FiLogIn className="title-icon" />
          <h1>Login Attempts</h1>
          <span className="attempts-count">{pagination.total} attempts</span>
        </div>
        <div className="login-attempts-actions">
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="login-attempts-toolbar">
        <div className="login-attempts-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by email, username, or IP..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="login-attempts-toolbar-right">
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
        <div className="login-attempts-filters">
          <div className="filter-group">
            <label className="filter-label">Result</label>
            <select
              className="filter-select"
              value={filters.result || ''}
              onChange={(e) => handleFilterChange({ result: e.target.value })}
            >
              <option value="">All Results</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Failure Reason</label>
            <select
              className="filter-select"
              value={filters.failure_reason || ''}
              onChange={(e) => handleFilterChange({ failure_reason: e.target.value })}
            >
              <option value="">All Reasons</option>
              <option value="wrong_password">Wrong Password</option>
              <option value="inactive">Account Inactive</option>
              <option value="locked">Account Locked</option>
              <option value="rate_limit">Rate Limit</option>
              <option value="mfa_required">MFA Required</option>
              <option value="invalid_mfa">Invalid MFA</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Hours</label>
            <select
              className="filter-select"
              value={filters.hours || 24}
              onChange={(e) => handleFilterChange({ hours: Number(e.target.value) })}
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={12}>Last 12 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={48}>Last 48 Hours</option>
              <option value={72}>Last 3 Days</option>
              <option value={168}>Last 7 Days</option>
            </select>
          </div>
          <button
            className="filter-clear"
            onClick={() => {
              handleFilterChange({ result: '', failure_reason: '', hours: 24 });
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {error && (
        <div className="login-attempts-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && loginAttempts.length === 0 ? (
        <div className="login-attempts-loading">
          <div className="spinner" />
          <p>Loading login attempts...</p>
        </div>
      ) : loginAttempts.length === 0 ? (
        <div className="login-attempts-empty">
          <FiLogIn className="empty-icon" />
          <h3>No login attempts found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="login-attempts-table-container">
            <table className="login-attempts-table">
              <thead>
                <tr>
                  <th>User / Identifier</th>
                  <th>Result</th>
                  <th>Failure Reason</th>
                  <th>IP Address</th>
                  <th>Attempted At</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {loginAttempts.map((attempt) => (
                  <tr key={attempt.id} className={`login-attempts-row result-${attempt.result}`}>
                    <td>
                      <div className="identifier-cell">
                        <div className="identifier-info">
                          <span className="identifier-email">
                            {attempt.user_email || attempt.identifier || 'Unknown'}
                          </span>
                          {attempt.user && (
                            <span className="identifier-user">
                              <FiUser /> {attempt.user}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{getResultBadge(attempt.result)}</td>
                    <td>
                      <span className="failure-reason">
                        {getFailureReason(attempt.failure_reason)}
                      </span>
                    </td>
                    <td>
                      <div className="ip-cell">
                        <FiMapPin className="ip-icon" />
                        <code className="ip-address">{attempt.ip_address || '-'}</code>
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <FiClock className="time-icon" />
                        <span>{formatDate(attempt.attempted_at)}</span>
                      </div>
                    </td>
                    <td>
                      {attempt.metadata && Object.keys(attempt.metadata).length > 0 ? (
                        <span className="metadata-indicator">
                          <FiShield /> {Object.keys(attempt.metadata).length} fields
                        </span>
                      ) : (
                        <span className="metadata-none">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="login-attempts-pagination">
            <div className="pagination-info">
              Showing {loginAttempts.length} of {pagination.total} attempts
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
export default LoginAttemptsView;
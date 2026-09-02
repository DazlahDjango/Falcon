import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiAlertCircle,
  FiShield,
  FiUser,
  FiClock,
  FiX,
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { AuditLogTable } from './AuditLogTable';
import { AuditFilters } from './AuditFilters';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const AuditLogList = () => {
  const navigate = useNavigate();
  const {
    logs,
    isLoading,
    error,
    pagination: storePagination,
    filters,
    getLogs,
    setFilters,
    setPage,
    setPageSize,
    clearError,
    exportLogs,
    isExporting,
  } = useAudit();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const pagination = usePagination({
    initialPage: storePagination.page || 1,
    initialPageSize: storePagination.pageSize || 20,
    initialTotal: storePagination.total || 0,
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.page, pagination.pageSize, filters, searchTerm]);

  const loadLogs = () => {
    getLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
      search: searchTerm || filters.search,
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
    loadLogs();
  };

  const handlePageChange = (newPage) => {
    pagination.goToPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    pagination.changePageSize(newSize);
    setPageSize(newSize);
  };

  const handleExport = async (exportData) => {
    await exportLogs(exportData);
    setShowExportModal(false);
  };

  const getSeverityCounts = () => {
    const counts = { info: 0, warning: 0, error: 0, critical: 0 };
    logs.forEach(log => {
      if (counts.hasOwnProperty(log.severity)) {
        counts[log.severity]++;
      }
    });
    return counts;
  };

  const severityCounts = getSeverityCounts();

  return (
    <div className="audit-list-container">
      <div className="audit-list-header">
        <div className="audit-list-title">
          <FiFileText className="title-icon" />
          <h1>Audit Logs</h1>
          <span className="audit-count">{pagination.total} records</span>
        </div>
        <div className="audit-list-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowExportModal(true)}
            disabled={isExporting || logs.length === 0}
          >
            <FiDownload /> {isExporting ? 'Exporting...' : 'Export'}
          </button>
          <button className="btn-icon" onClick={handleRefresh}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="audit-list-stats">
        <div className="stat-item">
          <FiFileText className="stat-icon" />
          <div>
            <span className="stat-value">{pagination.total}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-item severity-info">
          <FiAlertCircle className="stat-icon" />
          <div>
            <span className="stat-value">{severityCounts.info}</span>
            <span className="stat-label">Info</span>
          </div>
        </div>
        <div className="stat-item severity-warning">
          <FiAlertCircle className="stat-icon" />
          <div>
            <span className="stat-value">{severityCounts.warning}</span>
            <span className="stat-label">Warnings</span>
          </div>
        </div>
        <div className="stat-item severity-error">
          <FiAlertCircle className="stat-icon" />
          <div>
            <span className="stat-value">{severityCounts.error}</span>
            <span className="stat-label">Errors</span>
          </div>
        </div>
        <div className="stat-item severity-critical">
          <FiAlertCircle className="stat-icon" />
          <div>
            <span className="stat-value">{severityCounts.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
      </div>

      <div className="audit-list-toolbar">
        <div className="audit-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="audit-list-toolbar-right">
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
        <AuditFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {error && (
        <div className="audit-list-error">
          <span>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading && logs.length === 0 ? (
        <div className="audit-list-loading">
          <div className="spinner" />
          <p>Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="audit-list-empty">
          <FiFileText className="empty-icon" />
          <h3>No audit logs found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <AuditLogTable
            logs={logs}
            isLoading={isLoading}
            onRowClick={(log) => navigate(ACCOUNTS_ROUTES.AUDIT_LOG_DETAIL(log.id))}
          />

          <div className="audit-list-pagination">
            <div className="pagination-info">
              Showing {logs.length} of {pagination.total} records
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

      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Export Audit Logs</h2>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Export audit logs for the current filters and date range.</p>
              <div className="export-options">
                <button
                  className="btn-primary"
                  onClick={() => handleExport({ format: 'json' })}
                  disabled={isExporting}
                >
                  Export as JSON
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleExport({ format: 'csv' })}
                  disabled={isExporting}
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogList;
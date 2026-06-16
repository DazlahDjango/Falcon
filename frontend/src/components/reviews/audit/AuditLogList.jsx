// src/components/reviews/audit/AuditLogList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Filter, RefreshCw } from 'lucide-react';
import { useReviewsAuditLogs } from '../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewPagination, ReviewSearchBar } from '../common';
import AuditLogTable from './AuditLogTable';
import AuditLogFilters from './AuditLogFilters';

const AuditLogList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canView } = useReviewsAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (canView) {
      fetchAll({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters,
      });
    }
  }, [pagination.currentPage, pagination.pageSize, filters, canView, fetchAll]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setFilters({ search: term });
  }, [setFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSearchTerm('');
  }, [clearFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/audit/${id}`);
  };

  const handleRefresh = () => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  };

  if (!canView) {
    return (
      <div className="audit-log-list">
        <div className="audit-log-list-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading audit logs..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;

  return (
    <div className="audit-log-list">
      <div className="audit-log-list-header">
        <div className="audit-log-list-title-section">
          <h1 className="audit-log-list-title">Audit Logs</h1>
          <span className="audit-log-list-count">{pagination.totalItems} entries</span>
        </div>
        <button className="audit-log-list-refresh" onClick={handleRefresh}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="audit-log-list-toolbar">
        <ReviewSearchBar
          placeholder="Search audit logs..."
          onSearch={handleSearch}
          className="audit-log-search"
        />
        <AuditLogFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {data.length === 0 ? (
        <div className="audit-log-list-empty">
          <p>No audit logs found</p>
        </div>
      ) : (
        <>
          <AuditLogTable data={data} onView={handleView} />
          <ReviewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default AuditLogList;
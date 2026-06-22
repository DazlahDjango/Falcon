// src/components/reviews/pip-actions/list/PIPActionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { usePIPActions, usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import PIPActionTable from './PIPActionTable';

const PIPActionList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, pagination, setPagination, filters, setFilters, canManage } = usePIPActions();
  const { data: pips, fetchAll: fetchPIPs } = usePIP();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
    fetchPIPs({ page_size: 100 });
  }, [pagination.currentPage, pagination.pageSize, filters, fetchAll, fetchPIPs]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setFilters({ search: term });
  }, [setFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleView = (id) => {
    navigate(`/reviews/pip-actions/${id}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} color="#22c55e" />;
      case 'in_progress':
        return <Clock size={14} color="#f59e0b" />;
      case 'missed':
        return <XCircle size={14} color="#ef4444" />;
      case 'pending':
        return <Clock size={14} color="#6b7280" />;
      default:
        return <Clock size={14} color="#6b7280" />;
    }
  };

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading PIP actions..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="pip-action-list">
      <div className="pip-action-list-header">
        <div className="pip-action-list-title-section">
          <h1 className="pip-action-list-title">PIP Actions</h1>
          <span className="pip-action-list-count">{pagination.totalItems} actions</span>
        </div>
      </div>

      <div className="pip-action-list-toolbar">
        <ReviewSearchBar
          placeholder="Search actions..."
          onSearch={handleSearch}
          className="pip-action-search"
        />
        <div className="pip-action-list-filters">
          <select
            className="pip-action-filter-select"
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
          <select
            className="pip-action-filter-select"
            value={filters.priority || ''}
            onChange={(e) => setFilters({ priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className="pip-action-filter-select"
            value={filters.pip_id || ''}
            onChange={(e) => setFilters({ pip_id: e.target.value })}
          >
            <option value="">All PIPs</option>
            {pips?.map((pip) => (
              <option key={pip.id} value={pip.id}>
                {pip.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data.length === 0 ? (
        <ReviewEmptyState
          title="No PIP Actions Found"
          description="No actions are available for Performance Improvement Plans."
          icon="📋"
        />
      ) : (
        <>
          <PIPActionTable data={data} onView={handleView} />
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

export default PIPActionList;
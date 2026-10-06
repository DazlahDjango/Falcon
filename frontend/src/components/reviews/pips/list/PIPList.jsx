// src/components/reviews/pips/list/PIPList.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, AlertTriangle } from 'lucide-react';
import { usePIP, useReviewsPermissions } from '../../../../hooks/reviews';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewFilterBar } from '../../common';
import PIPCard from './PIPCard';
import PIPTable from './PIPTable';
import PIPFilters from './PIPFilters';

const PIPList = ({ isMyView = false, isTeamView = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isSupervisor, isExecutive, canCreatePIP } = useReviewsPermissions();
  const { data = [], loading, error, fetchAll, pagination, setPagination, filters, setFilters, clearFilters, canManage } = usePIP();
  const [viewMode, setViewMode] = useState('grid');

  const isStaffOnly = !isAdmin && !isHrAdmin && !isExecutive && !isTeamView && !isSupervisor;
  const isPersonalScope = isStaffOnly || isMyView;

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...(isPersonalScope ? { scope: 'my' } : {}),
      ...(isTeamView ? { is_team: true } : {}),
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters, isPersonalScope, isTeamView, fetchAll]);

  const displayData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (isPersonalScope && (user?.id || user?.email)) {
      return data.filter((item) => {
        const empId = typeof item.employee === 'object' && item.employee !== null
          ? (item.employee.id || item.employee.uuid)
          : (item.employee_id || item.employee);
        const idMatch = Boolean(empId && user?.id && String(empId).toLowerCase() === String(user.id).toLowerCase());
        const emailMatch = Boolean(item.employee_email && user?.email && item.employee_email.toLowerCase() === user.email.toLowerCase());
        return idMatch || emailMatch;
      });
    }
    return data;
  }, [data, isPersonalScope, user?.id, user?.email]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters({ search: searchTerm });
  }, [setFilters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  const handleCreate = () => {
    navigate('/reviews/pips/create');
  };

  const showCreateBtn = canManage || canCreatePIP;

  if (loading && !displayData.length) return <ReviewLoading size="lg" text="Loading Improvement Plans..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchAll()} />;

  return (
    <div className="pip-list">
      <div className="pip-list-header">
        <div className="pip-list-title-section">
          <h1 className="pip-list-title">
            {isPersonalScope ? 'My Improvement Plan' : isTeamView ? 'Team Improvement Plans' : 'Performance Improvement Plans'}
          </h1>
          <span className="pip-list-count">{displayData.length} {isPersonalScope ? 'Plans' : 'PIPs'}</span>
        </div>
        <div className="pip-list-actions">
          <div className="pip-list-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List size={18} />
            </button>
          </div>
          {showCreateBtn && !isPersonalScope && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New PIP
            </button>
          )}
        </div>
      </div>

      <div className="pip-list-toolbar">
        <ReviewSearchBar
          placeholder={isPersonalScope ? "Search your improvement plans..." : "Search PIPs..."}
          onSearch={handleSearch}
          className="pip-search"
        />
        <ReviewFilterBar
          filters={PIPFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {displayData.length === 0 ? (
        <ReviewEmptyState
          title={isPersonalScope ? "No Improvement Plans Found" : "No PIPs Found"}
          description={
            isPersonalScope
              ? "You do not have any active or past Performance Improvement Plans assigned to you."
              : isTeamView
              ? "None of your team members currently have active Improvement Plans."
              : "Create a Performance Improvement Plan to help employees improve performance."
          }
          icon="📋"
          actionLabel={showCreateBtn && !isPersonalScope ? "Create PIP" : undefined}
          onAction={showCreateBtn && !isPersonalScope ? handleCreate : undefined}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="pip-grid">
              {displayData.map((pip) => (
                <PIPCard key={pip.id} pip={pip} />
              ))}
            </div>
          ) : (
            <PIPTable data={displayData} />
          )}
          <ReviewPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems || displayData.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default PIPList;
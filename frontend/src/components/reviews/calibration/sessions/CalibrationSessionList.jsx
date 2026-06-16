// src/components/reviews/calibration/sessions/CalibrationSessionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, Calendar, Users, Clock } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewPagination, ReviewSearchBar, ReviewStatusBadge } from '../../common';
import CalibrationSessionCard from './CalibrationSessionCard';
import CalibrationSessionFilters from './CalibrationSessionFilters';

const CalibrationSessionList = () => {
  const navigate = useNavigate();
  const { sessionData, sessionLoading, sessionError, fetchSessions, pagination, setPagination, filters, setFilters, clearFilters, canManage } = useCalibration();
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchSessions({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...filters,
    });
  }, [pagination.currentPage, pagination.pageSize, filters]);

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
    navigate('/reviews/calibration/sessions/create');
  };

  const handleView = (id) => {
    navigate(`/reviews/calibration/sessions/${id}`);
  };

  if (sessionLoading && !sessionData.length) return <ReviewLoading size="lg" text="Loading calibration sessions..." />;
  if (sessionError) return <ReviewError error={sessionError} onRetry={() => fetchSessions()} />;

  return (
    <div className="calibration-session-list">
      <div className="calibration-session-list-header">
        <div className="calibration-session-list-title-section">
          <h1 className="calibration-session-list-title">Calibration Sessions</h1>
          <span className="calibration-session-list-count">{pagination.totalItems} sessions</span>
        </div>
        <div className="calibration-session-list-actions">
          <div className="calibration-session-list-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              New Session
            </button>
          )}
        </div>
      </div>

      <div className="calibration-session-list-toolbar">
        <ReviewSearchBar
          placeholder="Search sessions..."
          onSearch={handleSearch}
          className="calibration-session-search"
        />
        <CalibrationSessionFilters
          onFilterChange={handleFilterChange}
          onClearAll={handleClearFilters}
        />
      </div>

      {sessionData.length === 0 ? (
        <ReviewEmptyState
          title="No Calibration Sessions Found"
          description="Create a calibration session to start reviewing and adjusting ratings."
          icon="⚖️"
          actionLabel="Create Session"
          onAction={handleCreate}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="calibration-session-grid">
              {sessionData.map((session) => (
                <CalibrationSessionCard key={session.id} session={session} onView={handleView} />
              ))}
            </div>
          ) : (
            <div className="calibration-session-list-view">
              {sessionData.map((session) => (
                <div key={session.id} className="calibration-session-list-item" onClick={() => handleView(session.id)}>
                  <div className="calibration-session-list-item-info">
                    <h3 className="calibration-session-list-item-title">{session.name}</h3>
                    <div className="calibration-session-list-item-meta">
                      <span className="calibration-session-list-item-cycle">{session.review_cycle_name}</span>
                      <span className="calibration-session-list-item-type">{session.session_type_display}</span>
                      <span className="calibration-session-list-item-date">
                        <Calendar size={14} />
                        {new Date(session.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="calibration-session-list-item-participants">
                        <Users size={14} />
                        {session.participants_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="calibration-session-list-item-status">
                    <ReviewStatusBadge status={session.status} />
                    {session.is_upcoming && (
                      <span className="calibration-session-list-item-upcoming">Upcoming</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default CalibrationSessionList;
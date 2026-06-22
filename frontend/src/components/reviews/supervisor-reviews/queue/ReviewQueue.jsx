// src/components/reviews/supervisor-reviews/queue/ReviewQueue.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, Users, AlertCircle } from 'lucide-react';
import { useSupervisorReview } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewEmptyState, ReviewSearchBar } from '../../common';
import ReviewQueueItem from './ReviewQueueItem';
import ReviewQueueFilters from './ReviewQueueFilters';

const ReviewQueue = () => {
  const navigate = useNavigate();
  const { myQueue, loading, error, fetchQueue, filters, setFilters } = useSupervisorReview();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handleViewReview = useCallback((id) => {
    navigate(`/reviews/supervisor-reviews/${id}`);
  }, [navigate]);

  const filteredQueue = myQueue.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.employee_name?.toLowerCase().includes(search) ||
      item.employee_email?.toLowerCase().includes(search) ||
      item.review_cycle_name?.toLowerCase().includes(search)
    );
  });

  if (loading) return <ReviewLoading size="lg" text="Loading review queue..." />;
  if (error) return <ReviewError error={error} onRetry={fetchQueue} />;

  return (
    <div className="review-queue">
      <div className="review-queue-header">
        <div className="review-queue-title-section">
          <h1 className="review-queue-title">Review Queue</h1>
          <span className="review-queue-count">{filteredQueue.length} pending reviews</span>
        </div>
      </div>

      <div className="review-queue-toolbar">
        <ReviewSearchBar
          placeholder="Search employees..."
          onSearch={handleSearch}
          className="review-queue-search"
        />
        <ReviewQueueFilters onFilterChange={handleFilterChange} />
      </div>

      {filteredQueue.length === 0 ? (
        <ReviewEmptyState
          title="No Pending Reviews"
          description={searchTerm ? 'No reviews match your search.' : 'All reviews have been completed.'}
          icon="✅"
        />
      ) : (
        <div className="review-queue-list">
          {filteredQueue.map((review) => (
            <ReviewQueueItem
              key={review.id}
              review={review}
              onView={handleViewReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
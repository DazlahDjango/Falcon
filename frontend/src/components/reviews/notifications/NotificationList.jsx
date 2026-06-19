// src/components/reviews/notifications/NotificationList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, RefreshCw, Filter } from 'lucide-react';
import { useReviewsNotifications } from '../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewPagination } from '../common';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchAll, markAllAsRead, pagination, setPagination, unreadCount, canManage } = useReviewsNotifications();

  useEffect(() => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
    });
  }, [pagination.currentPage, pagination.pageSize, fetchAll]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
    });
  };

  const handleRefresh = () => {
    fetchAll({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
    });
  };

  const handlePageChange = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  const handlePageSizeChange = useCallback((size) => {
    setPagination({ pageSize: size, currentPage: 1 });
  }, [setPagination]);

  if (!canManage) {
    return (
      <div className="notification-list">
        <div className="notification-list-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view notifications.</p>
        </div>
      </div>
    );
  }

  if (loading && !data.length) return <ReviewLoading size="lg" text="Loading notifications..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;

  return (
    <div className="notification-list">
      <div className="notification-list-header">
        <div className="notification-list-title-section">
          <h1 className="notification-list-title">Notifications</h1>
          <span className="notification-list-count">
            {pagination.totalItems} notifications
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </span>
        </div>
        <div className="notification-list-actions">
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
          <button className="notification-list-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="notification-list-empty">
          <Bell size={48} color="#d1d5db" />
          <h3>No Notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <>
          <div className="notification-list-items">
            {data.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
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

export default NotificationList;
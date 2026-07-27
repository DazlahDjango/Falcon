// src/pages/reviews/dashboard/ReviewsDashboardRedirect.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useReviewsPermissions } from '../../../hooks/reviews';

const ReviewsDashboardRedirect = () => {
  const { isSuperAdmin, isClientAdmin, isExecutive, isSupervisor } = useReviewsPermissions();

  if (isSuperAdmin || isClientAdmin) {
    return <Navigate to="/reviews/dashboard/admin" replace />;
  }
  if (isExecutive) {
    return <Navigate to="/reviews/dashboard/executive" replace />;
  }
  if (isSupervisor) {
    return <Navigate to="/reviews/dashboard/supervisor" replace />;
  }
  return <Navigate to="/reviews/dashboard/staff" replace />;
};

export default ReviewsDashboardRedirect;

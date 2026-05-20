import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ComplianceWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Compliance Status',
  onRefresh,
  onExport
}) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load compliance data" message={error} />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Compliance Data" message="No compliance data available." />
      </DashboardCard>
    );
  }

  const submissionRate = data.data_submission_rate || 0;
  const reviewRate = data.review_completion_rate || 0;
  const pendingReviews = data.pending_reviews || 0;
  const overdueSubmissions = data.overdue_submissions || 0;

  const getRateColor = (rate) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <DashboardCard title={title} onRefresh={onRefresh} onExport={onExport}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Data Submission</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getRateColor(submissionRate) }}>
            {Math.round(submissionRate)}%
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${submissionRate}%`, height: '100%', background: getRateColor(submissionRate), borderRadius: '10px' }} />
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Review Completion</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getRateColor(reviewRate) }}>
            {Math.round(reviewRate)}%
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${reviewRate}%`, height: '100%', background: getRateColor(reviewRate), borderRadius: '10px' }} />
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending Reviews</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: pendingReviews > 0 ? '#f59e0b' : '#10b981' }}>
            {pendingReviews}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Overdue Submissions</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: overdueSubmissions > 0 ? '#ef4444' : '#10b981' }}>
            {overdueSubmissions}
          </div>
        </div>
      </div>
      
      {submissionRate < 100 && (
        <div style={{ marginTop: '12px', padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
          ⚠️ {data.users_missing_data || 0} users have not submitted data for this period
        </div>
      )}
    </DashboardCard>
  );
};

ComplianceWidget.propTypes = {
  data: PropTypes.shape({
    data_submission_rate: PropTypes.number,
    review_completion_rate: PropTypes.number,
    pending_reviews: PropTypes.number,
    overdue_submissions: PropTypes.number,
    users_missing_data: PropTypes.number
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func
};
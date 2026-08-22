// src/pages/reviews/feedback/FeedbackRequestDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Clock, User, Calendar, Shield, MessageSquare, AlertCircle } from 'lucide-react';
import { useFeedback } from '../../../hooks/reviews';
import { ReviewBreadcrumbs, ReviewLoading, ReviewError, ReviewStatusBadge } from '../../../components/reviews/common';
import FeedbackResponseView from '../../../components/reviews/feedback/responses/FeedbackResponseView';
import { REVIEW_ROUTES } from '../../../config/constants/reviewRouteConstants';

const FeedbackRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedRequest, 
    loading, 
    error, 
    fetchRequest, 
    remind, 
    cancel,
    fetchResponseForRequest 
  } = useFeedback();

  const [response, setResponse] = useState(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchRequest(id);
    }
  }, [id, fetchRequest]);

  useEffect(() => {
    const loadResponse = async () => {
      if (selectedRequest && (selectedRequest.has_response || selectedRequest.status === 'submitted' || selectedRequest.status === 'completed')) {
        setResponseLoading(true);
        try {
          const res = await fetchResponseForRequest(selectedRequest.id);
          if (res && !res.message) {
            setResponse(res);
          }
        } catch (err) {
          console.error('Failed to load feedback response:', err);
        } finally {
          setResponseLoading(false);
        }
      }
    };

    loadResponse();
  }, [selectedRequest, fetchResponseForRequest]);

  const handleRemind = async () => {
    try {
      await remind(selectedRequest.id);
      setActionSuccess('Reminder sent successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchRequest(id);
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this feedback request?')) {
      try {
        await cancel(selectedRequest.id);
        setActionSuccess('Request cancelled successfully.');
        setTimeout(() => setActionSuccess(''), 4000);
        fetchRequest(id);
      } catch (err) {
        console.error('Failed to cancel request:', err);
      }
    }
  };

  if (loading && !selectedRequest) {
    return <ReviewLoading size="lg" text="Loading feedback request details..." />;
  }

  if (error) {
    return <ReviewError error={error} onRetry={() => fetchRequest(id)} />;
  }

  const req = selectedRequest || {};

  return (
    <div className="feedback-request-detail-page" style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header & Breadcrumbs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/reviews/feedback/requests')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#334155',
            marginBottom: '0.75rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Requests
        </button>

        <ReviewBreadcrumbs
          items={[
            { label: '360 Feedback', path: '/reviews/feedback' },
            { label: 'Requests', path: '/reviews/feedback/requests' },
            { label: `Request #${id}`, path: `/reviews/feedback/requests/${id}`, isActive: true }
          ]}
        />
      </div>

      {actionSuccess && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {/* Main Request Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              360 Feedback Request
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0' }}>
              Feedback for {req.subject_name || req.subject_email || 'Employee'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
              <span><strong>Cycle:</strong> {req.review_cycle_name || 'Annual Review'}</span>
              <span><strong>Relationship:</strong> {req.reviewer_type_display || req.reviewer_type || 'Peer'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ReviewStatusBadge status={req.status || 'draft'} />
            {req.status === 'draft' && (
              <>
                <button
                  onClick={handleRemind}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} /> Send Reminder
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    background: '#fff',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Subject (Being Reviewed)</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>{req.subject_name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.subject_email}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Reviewer (Feedback Provider)</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>{req.reviewer_name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.reviewer_email}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Due Date</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>
              {req.due_date ? new Date(req.due_date).toLocaleDateString() : 'No deadline'}
            </div>
            <div style={{ fontSize: '0.8rem', color: req.is_overdue ? '#ef4444' : '#64748b' }}>
              {req.is_overdue ? '⚠️ Overdue' : 'On track'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Privacy & Anonymity</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>
              {req.is_anonymous ? '🔒 Anonymous Feedback' : 'Attributed'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {req.is_required ? 'Mandatory submission' : 'Optional submission'}
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Response Section */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="#3b82f6" /> Submitted Feedback Response
        </h3>

        {responseLoading ? (
          <ReviewLoading size="md" text="Loading response details..." />
        ) : response ? (
          <FeedbackResponseView response={response} />
        ) : (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1'
          }}>
            <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Awaiting Feedback Submission</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto' }}>
              The reviewer ({req.reviewer_name}) has not submitted their feedback yet. They have until {req.due_date || 'the deadline'} to complete it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackRequestDetailPage;

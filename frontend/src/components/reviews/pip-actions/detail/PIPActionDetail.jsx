// src/components/reviews/pip-actions/detail/PIPActionDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw, Calendar, Users, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { usePIPActions } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import PIPActionComplete from './PIPActionComplete';
import PIPActionVerify from './PIPActionVerify';

const PIPActionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, deleteAction, canManage } = usePIPActions();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selected?.title}"?`)) {
      await deleteAction(id);
      navigate('/reviews/pip-actions');
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'in_progress':
        return <Clock size={20} color="#f59e0b" />;
      case 'missed':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading PIP action..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  const isCompleted = selected.status === 'completed';
  const canComplete = !isCompleted && (selected.status === 'pending' || selected.status === 'in_progress');
  const canVerify = isCompleted && selected.requires_evidence && !selected.evidence_verified_by;

  return (
    <div className="pip-action-detail">
      <div className="pip-action-detail-header">
        <button className="pip-action-detail-back" onClick={() => navigate('/reviews/pip-actions')}>
          <ArrowLeft size={20} />
          Back to PIP Actions
        </button>
        <div className="pip-action-detail-actions">
          <button className="pip-action-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          {canManage && !isCompleted && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/reviews/pip-actions/${id}/edit`)}
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pip-action-detail-content">
        <div className="pip-action-detail-top">
          <div className="pip-action-detail-title-section">
            <div>
              <h1 className="pip-action-detail-title">{selected.title}</h1>
              <div className="pip-action-detail-subtitle">
                <span className="pip-action-detail-pip">
                  <FileText size={16} />
                  {selected.pip_title || selected.pip}
                </span>
                <span className="pip-action-detail-priority" style={{ color: getPriorityColor(selected.priority) }}>
                  {selected.priority} priority
                </span>
              </div>
            </div>
            <div className="pip-action-detail-badges">
              <div className="pip-action-detail-status">
                {getStatusIcon(selected.status)}
                <span>{selected.status_display || selected.status}</span>
              </div>
              {selected.is_overdue && !isCompleted && (
                <span className="pip-action-detail-overdue">
                  <XCircle size={16} />
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pip-action-detail-tabs">
          <button
            className={`pip-action-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          {canComplete && (
            <button
              className={`pip-action-detail-tab ${activeTab === 'complete' ? 'active' : ''}`}
              onClick={() => setActiveTab('complete')}
            >
              Complete Action
            </button>
          )}
          {canVerify && (
            <button
              className={`pip-action-detail-tab ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              Verify Evidence
            </button>
          )}
        </div>

        <div className="pip-action-detail-body">
          {activeTab === 'details' && (
            <div className="pip-action-detail-info">
              <div className="pip-action-detail-info-grid">
                <div className="pip-action-detail-info-item">
                  <span className="pip-action-detail-info-label">Description</span>
                  <p className="pip-action-detail-info-value">
                    {selected.description || 'No description provided'}
                  </p>
                </div>
                <div className="pip-action-detail-info-item">
                  <span className="pip-action-detail-info-label">Due Date</span>
                  <p className="pip-action-detail-info-value">
                    {new Date(selected.due_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {selected.completed_at && (
                  <div className="pip-action-detail-info-item">
                    <span className="pip-action-detail-info-label">Completed Date</span>
                    <p className="pip-action-detail-info-value">
                      {new Date(selected.completed_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                <div className="pip-action-detail-info-item">
                  <span className="pip-action-detail-info-label">Requires Evidence</span>
                  <p className="pip-action-detail-info-value">
                    {selected.requires_evidence ? 'Yes' : 'No'}
                  </p>
                </div>
                {selected.evidence_verified_by && (
                  <div className="pip-action-detail-info-item">
                    <span className="pip-action-detail-info-label">Verified By</span>
                    <p className="pip-action-detail-info-value">
                      {selected.evidence_verified_by}
                      {selected.evidence_verified_at && (
                        <span className="pip-action-detail-info-sub">
                          on {new Date(selected.evidence_verified_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {selected.progress_notes && (
                  <div className="pip-action-detail-info-item full">
                    <span className="pip-action-detail-info-label">Progress Notes</span>
                    <p className="pip-action-detail-info-value">{selected.progress_notes}</p>
                  </div>
                )}
                {selected.evidence && (
                  <div className="pip-action-detail-info-item full">
                    <span className="pip-action-detail-info-label">Evidence</span>
                    <a
                      href={selected.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pip-action-detail-info-link"
                    >
                      View Evidence
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'complete' && (
            <PIPActionComplete
              action={selected}
              onComplete={() => {
                fetchOne(id);
                setActiveTab('details');
              }}
            />
          )}

          {activeTab === 'verify' && (
            <PIPActionVerify
              action={selected}
              onVerify={() => {
                fetchOne(id);
                setActiveTab('details');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PIPActionDetail;
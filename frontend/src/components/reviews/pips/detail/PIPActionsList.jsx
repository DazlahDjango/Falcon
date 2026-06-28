// src/components/reviews/pips/detail/PIPActionsList.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllPIPActions } from '../../../../store/reviews/selectors';
import { usePIPActions } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import { CheckCircle, Clock, XCircle, AlertCircle, Plus, Eye, Check, RefreshCw } from 'lucide-react';

const PIPActionsList = ({ pipId }) => {
  const { fetchForPIP, complete, verify, canManage } = usePIPActions();
  const actions = useSelector((state) => selectAllPIPActions(state));
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    if (pipId) {
      fetchForPIP(pipId);
    }
  }, [pipId, fetchForPIP]);

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      await complete(id);
      await fetchForPIP(pipId);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    setLoading(true);
    try {
      await verify(id);
      await fetchForPIP(pipId);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#22c55e" />;
      case 'in_progress':
        return <Clock size={16} color="#f59e0b" />;
      case 'missed':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
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

  if (!actions) return <ReviewLoading size="sm" text="Loading actions..." />;

  const pipActions = actions.filter((a) => a.pip === pipId);

  return (
    <div className="pip-actions-list">
      <div className="pip-actions-list-header">
        <h3 className="pip-actions-list-title">Actions</h3>
        <span className="pip-actions-list-count">{pipActions.length} actions</span>
      </div>

      {pipActions.length === 0 ? (
        <div className="pip-actions-list-empty">No actions defined</div>
      ) : (
        <div className="pip-actions-list-items">
          {pipActions.map((action) => (
            <div key={action.id} className="pip-actions-list-item">
              <div className="pip-actions-list-item-header">
                <div className="pip-actions-list-item-left">
                  <div className="pip-actions-list-item-icon">
                    {getStatusIcon(action.status)}
                  </div>
                  <div>
                    <div className="pip-actions-list-item-title">{action.title}</div>
                    <div className="pip-actions-list-item-meta">
                      <span className="pip-actions-list-item-priority" style={{ color: getPriorityColor(action.priority) }}>
                        {action.priority}
                      </span>
                      <span className="pip-actions-list-item-due">
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </span>
                      {action.is_overdue && (
                        <span className="pip-actions-list-item-overdue">
                          <AlertCircle size={12} />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pip-actions-list-item-right">
                  {action.status === 'completed' && action.requires_evidence && !action.evidence_verified_by && (
                    <button
                      className="pip-actions-list-item-btn verify"
                      onClick={() => handleVerify(action.id)}
                      disabled={loading}
                    >
                      <Check size={14} />
                      Verify
                    </button>
                  )}
                  {action.status !== 'completed' && (
                    <button
                      className="pip-actions-list-item-btn complete"
                      onClick={() => handleComplete(action.id)}
                      disabled={loading}
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  )}
                  <button
                    className="pip-actions-list-item-btn view"
                    onClick={() => setSelectedAction(selectedAction === action.id ? null : action.id)}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {selectedAction === action.id && (
                <div className="pip-actions-list-item-detail">
                  {action.description && (
                    <div className="pip-actions-list-item-detail-section">
                      <span className="pip-actions-list-item-detail-label">Description</span>
                      <p className="pip-actions-list-item-detail-text">{action.description}</p>
                    </div>
                  )}
                  {action.progress_notes && (
                    <div className="pip-actions-list-item-detail-section">
                      <span className="pip-actions-list-item-detail-label">Progress Notes</span>
                      <p className="pip-actions-list-item-detail-text">{action.progress_notes}</p>
                    </div>
                  )}
                  {action.evidence && (
                    <div className="pip-actions-list-item-detail-section">
                      <span className="pip-actions-list-item-detail-label">Evidence</span>
                      <a
                        href={action.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pip-actions-list-item-detail-link"
                      >
                        View Evidence
                      </a>
                    </div>
                  )}
                  {action.evidence_verified_by && (
                    <div className="pip-actions-list-item-detail-section">
                      <span className="pip-actions-list-item-detail-label">Verified</span>
                      <span className="pip-actions-list-item-detail-verified">
                        <CheckCircle size={14} color="#22c55e" />
                        Verified by {action.evidence_verified_by}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PIPActionsList;
// src/components/reviews/pip-actions/list/PIPActionTable.jsx
import React from 'react';
import { Eye, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const PIPActionTable = ({ data, onView }) => {
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
        return <CheckCircle size={16} color="#22c55e" />;
      case 'in_progress':
        return <Clock size={16} color="#f59e0b" />;
      case 'missed':
        return <XCircle size={16} color="#ef4444" />;
      case 'pending':
        return <Clock size={16} color="#6b7280" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      missed: 'Missed',
    };
    return labels[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="pip-action-table-container">
      <table className="pip-action-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>PIP</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((action) => (
            <tr key={action.id} className="pip-action-table-row" onClick={() => onView(action.id)}>
              <td className="pip-action-table-title">
                <div className="pip-action-table-title-content">
                  <span className="pip-action-table-title-text">{action.title}</span>
                  {action.is_overdue && action.status !== 'completed' && (
                    <span className="pip-action-table-overdue-badge">
                      <AlertCircle size={12} />
                      Overdue
                    </span>
                  )}
                </div>
                {action.description && (
                  <div className="pip-action-table-description">{action.description}</div>
                )}
              </td>
              <td className="pip-action-table-pip">
                {action.pip_title || action.pip}
              </td>
              <td>
                <span
                  className="pip-action-table-priority"
                  style={{ color: getPriorityColor(action.priority) }}
                >
                  {action.priority}
                </span>
              </td>
              <td className="pip-action-table-due">
                {formatDate(action.due_date)}
                {action.completed_at && (
                  <span className="pip-action-table-completed-date">
                    Completed: {formatDate(action.completed_at)}
                  </span>
                )}
              </td>
              <td>
                <div className="pip-action-table-status">
                  {getStatusIcon(action.status)}
                  <span>{getStatusLabel(action.status)}</span>
                </div>
              </td>
              <td>
                {action.requires_evidence ? (
                  action.evidence_verified_by ? (
                    <span className="pip-action-table-verified">✓ Verified</span>
                  ) : action.evidence ? (
                    <span className="pip-action-table-has-evidence">Has Evidence</span>
                  ) : (
                    <span className="pip-action-table-no-evidence">No Evidence</span>
                  )
                ) : (
                  <span className="pip-action-table-not-required">—</span>
                )}
              </td>
              <td>
                <button
                  className="pip-action-table-action-btn"
                  onClick={(e) => { e.stopPropagation(); onView(action.id); }}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PIPActionTable;
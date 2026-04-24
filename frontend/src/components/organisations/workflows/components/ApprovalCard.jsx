import React from 'react';
import { Link } from 'react-router-dom';

const ApprovalCard = ({ approval, onApprove, onReject, loading }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'kpi': return '📊';
      case 'budget': return '💰';
      case 'leave': return '🏖️';
      case 'expense': return '🧾';
      case 'position': return '💺';
      default: return '📋';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      in_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Review' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getTypeIcon(approval.type)}</span>
            <h3 className="text-md font-semibold text-gray-900">{approval.title}</h3>
            {getStatusBadge(approval.status)}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{approval.description}</p>
          
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>👤</span>
              <span>Submitted by: {approval.submitted_by_name || approval.submitted_by_email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>Submitted: {new Date(approval.created_at).toLocaleDateString()}</span>
            </div>
            {approval.due_date && (
              <div className="flex items-center space-x-1">
                <span>⏰</span>
                <span>Due: {new Date(approval.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {approval.priority && (
              <div className="flex items-center space-x-1">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                  {approval.priority.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Details Section */}
          {approval.details && Object.keys(approval.details).length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-2">Details:</p>
              <div className="space-y-1">
                {Object.entries(approval.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (only show for pending approvals) */}
      {approval.status === 'pending' && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={() => onReject(approval)}
            disabled={loading}
            className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(approval)}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      )}

      {/* View Details Link for non-pending */}
      {approval.status !== 'pending' && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            to={`/workflows/${approval.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View Details →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ApprovalCard;
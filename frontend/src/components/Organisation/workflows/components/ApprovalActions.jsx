import React, { useState } from 'react';

const ApprovalActions = ({ approval, onApprove, onReject, onRequestChanges, loading }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState(null);

  const handleActionClick = (selectedAction) => {
    setAction(selectedAction);
    setShowCommentModal(true);
  };

  const handleConfirm = () => {
    if (action === 'approve') {
      onApprove(approval, comment);
    } else if (action === 'reject') {
      onReject(approval, comment);
    } else if (action === 'request_changes') {
      onRequestChanges(approval, comment);
    }
    setShowCommentModal(false);
    setComment('');
    setAction(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleActionClick('approve')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => handleActionClick('request_changes')}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
        >
          🔄 Request Changes
        </button>
        <button
          onClick={() => handleActionClick('reject')}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          ✗ Reject
        </button>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {action === 'approve' ? 'Approve Request' : 
                 action === 'reject' ? 'Reject Request' : 
                 'Request Changes'}
              </h2>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment('');
                  setAction(null);
                }}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  {action === 'approve' ? 'Add any comments (optional):' :
                   action === 'reject' ? 'Please provide a reason for rejection:' :
                   'Please provide feedback for changes:'}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={action === 'approve' ? "Great work!" : "Please provide details..."}
                  required={action !== 'approve'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment('');
                    setAction(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || (action !== 'approve' && !comment.trim())}
                  className={`px-4 py-2 rounded-md text-white ${
                    action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  } disabled:opacity-50`}
                >
                  Confirm {action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Request Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalActions;
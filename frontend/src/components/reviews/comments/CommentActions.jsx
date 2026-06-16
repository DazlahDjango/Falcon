// src/components/reviews/comments/CommentActions.jsx
import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { ReviewConfirmDialog } from '../../common';

const CommentActions = ({
  comment,
  isAuthor,
  showActions,
  onEdit,
  onResolve,
  onUnresolve,
  onDelete,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await onDelete(comment.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="comment-actions">
      {showActions && (
        <div className="comment-actions-buttons">
          {isAuthor && !comment.is_resolved && (
            <button
              className="comment-action-btn edit"
              onClick={onEdit}
              title="Edit"
            >
              <Edit size={14} />
            </button>
          )}
          {!comment.is_resolved && (
            <button
              className="comment-action-btn resolve"
              onClick={() => onResolve(comment.id)}
              title="Resolve"
            >
              <CheckCircle size={14} />
            </button>
          )}
          {comment.is_resolved && (
            <button
              className="comment-action-btn unresolve"
              onClick={() => onUnresolve(comment.id)}
              title="Unresolve"
            >
              <XCircle size={14} />
            </button>
          )}
          {(isAuthor || comment.canManage) && (
            <button
              className="comment-action-btn delete"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <ReviewConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default CommentActions;
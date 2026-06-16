// src/components/reviews/comments/CommentItem.jsx
import React, { useState } from 'react';
import { User, Clock, CheckCircle, XCircle, Edit, Trash2, Reply } from 'lucide-react';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import CommentActions from './CommentActions';
import CommentForm from './CommentForm';

const CommentItem = ({
  comment,
  contentType,
  objectId,
  depth = 0,
  onReply,
  onEdit,
  onResolve,
  onUnresolve,
  onDelete,
  isExpanded = true,
  onToggleExpand,
}) => {
  const { user } = useAuthContext();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isAuthor = user?.id === comment.author;
  const maxDepth = 3;
  const isNested = depth > 0;
  const hasReplies = comment.replies_count > 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReplySubmit = async (replyText) => {
    await onReply(comment.id, replyText);
    setShowReplyForm(false);
  };

  const handleEditSubmit = async (editText) => {
    await onEdit(comment.id, editText);
    setIsEditing(false);
  };

  return (
    <div className={`comment-item ${isNested ? 'comment-item-nested' : ''}`} style={{ paddingLeft: isNested ? 20 : 0 }}>
      <div
        className={`comment-item-content ${comment.is_resolved ? 'comment-item-resolved' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="comment-item-header">
          <div className="comment-item-author">
            <div className="comment-item-avatar">
              {comment.author_name?.charAt(0) || 'U'}
            </div>
            <span className="comment-item-author-name">{comment.author_name}</span>
            {comment.is_resolved && (
              <span className="comment-item-resolved-badge">
                <CheckCircle size={12} />
                Resolved
              </span>
            )}
          </div>
          <div className="comment-item-meta">
            <span className="comment-item-date">
              <Clock size={12} />
              {formatDate(comment.created_at)}
            </span>
            {comment.edited_at && (
              <span className="comment-item-edited">(edited)</span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="comment-item-edit-form">
            <CommentForm
              contentType={contentType}
              objectId={objectId}
              initialValue={comment.comment}
              onSuccess={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              placeholder="Edit your comment..."
              submitLabel="Save"
            />
          </div>
        ) : (
          <p className="comment-item-text">{comment.comment}</p>
        )}

        {!isEditing && (
          <div className="comment-item-footer">
            <div className="comment-item-actions-left">
              {!comment.is_resolved && (
                <button
                  className="comment-item-action-btn reply"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply size={14} />
                  Reply
                </button>
              )}
            </div>
            <CommentActions
              comment={comment}
              isAuthor={isAuthor}
              showActions={showActions}
              onEdit={() => setIsEditing(true)}
              onResolve={onResolve}
              onUnresolve={onUnresolve}
              onDelete={onDelete}
            />
          </div>
        )}

        {showReplyForm && (
          <div className="comment-item-reply-form">
            <CommentForm
              contentType={contentType}
              objectId={objectId}
              onSuccess={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              submitLabel="Reply"
              isReply
            />
          </div>
        )}
      </div>

      {hasReplies && comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div className="comment-item-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              contentType={contentType}
              objectId={objectId}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onResolve={onResolve}
              onUnresolve={onUnresolve}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {hasReplies && depth >= maxDepth && (
        <div className="comment-item-replies-note">
          <button
            className="comment-item-view-replies"
            onClick={onToggleExpand}
          >
            {isExpanded ? 'Hide replies' : `View ${comment.replies_count} replies`}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
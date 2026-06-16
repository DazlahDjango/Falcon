// src/components/reviews/comments/CommentForm.jsx
import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useComments } from '../../../hooks/reviews';

const CommentForm = ({
  contentType,
  objectId,
  parentId = null,
  initialValue = '',
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  isReply = false,
}) => {
  const { createComment, canManage } = useComments();
  const [comment, setComment] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment = await createComment({
        content_type: contentType,
        object_id: objectId,
        comment_type: 'general',
        comment: comment.trim(),
        parent_comment: parentId,
        visibility: 'public',
      });
      setComment('');
      if (onSuccess) onSuccess(newComment);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) return null;

  return (
    <form className={`comment-form ${isReply ? 'comment-form-reply' : ''}`} onSubmit={handleSubmit}>
      <div className="comment-form-group">
        <textarea
          className="comment-form-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 2 : 3}
          disabled={isSubmitting}
        />
      </div>
      <div className="comment-form-actions">
        {onCancel && (
          <button
            type="button"
            className="comment-form-cancel"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`btn ${isReply ? 'btn-sm' : ''} btn-primary comment-form-submit`}
          disabled={isSubmitting || !comment.trim()}
        >
          <Send size={isReply ? 14 : 16} />
          {isSubmitting ? 'Sending...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
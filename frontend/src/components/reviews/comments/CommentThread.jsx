// src/components/reviews/comments/CommentThread.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useComments } from '../../../hooks/reviews';
import CommentItem from './CommentItem';

const CommentThread = ({
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
  const { getReplies } = useComments();
  const [replies, setReplies] = useState(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const maxDepth = 3;

  useEffect(() => {
    if (isExpanded && comment.replies_count > 0 && !comment.replies) {
      loadReplies();
    }
  }, [isExpanded]);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const repliesData = await getReplies(comment.id);
      setReplies(repliesData);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async (parentId, replyText) => {
    const newReply = await onReply(parentId, replyText);
    setReplies((prev) => [...prev, newReply]);
  };

  return (
    <div className="comment-thread">
      <CommentItem
        comment={comment}
        contentType={contentType}
        objectId={objectId}
        depth={depth}
        onReply={handleReply}
        onEdit={onEdit}
        onResolve={onResolve}
        onUnresolve={onUnresolve}
        onDelete={onDelete}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {isExpanded && depth < maxDepth && replies.length > 0 && (
        <div className="comment-thread-replies">
          {replies.map((reply) => (
            <CommentThread
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
              isExpanded={true}
            />
          ))}
        </div>
      )}

      {comment.replies_count > 0 && comment.replies_count !== replies.length && (
        <button
          className="comment-thread-load-more"
          onClick={loadReplies}
          disabled={loadingReplies}
        >
          {loadingReplies ? 'Loading...' : `View ${comment.replies_count - replies.length} more replies`}
        </button>
      )}
    </div>
  );
};

export default CommentThread;
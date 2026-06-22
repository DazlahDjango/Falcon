// src/components/reviews/comments/CommentList.jsx
import React, { useState, useEffect } from 'react';
import { useComments } from '../../../hooks/reviews';
import { ReviewLoading, ReviewEmptyState } from '../common';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

const CommentList = ({ contentType, objectId, onCommentAdded, onCommentUpdated }) => {
  const { data, loading, error, fetchCommentsForObject, getReplies, canManage } = useComments();
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    if (contentType && objectId) {
      fetchCommentsForObject(contentType, objectId);
    }
  }, [contentType, objectId, fetchCommentsForObject]);

  const handleReply = async (parentId, comment) => {
    const newComment = await createComment({
      content_type: contentType,
      object_id: objectId,
      comment_type: 'general',
      comment,
      parent_comment: parentId,
    });
    await fetchCommentsForObject(contentType, objectId);
    if (onCommentAdded) onCommentAdded(newComment);
  };

  const handleEdit = async (id, comment) => {
    await editComment(id, comment);
    await fetchCommentsForObject(contentType, objectId);
    if (onCommentUpdated) onCommentUpdated();
  };

  const handleResolve = async (id) => {
    await resolveComment(id);
    await fetchCommentsForObject(contentType, objectId);
    if (onCommentUpdated) onCommentUpdated();
  };

  const handleUnresolve = async (id) => {
    await unresolveComment(id);
    await fetchCommentsForObject(contentType, objectId);
    if (onCommentUpdated) onCommentUpdated();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(id);
      await fetchCommentsForObject(contentType, objectId);
      if (onCommentUpdated) onCommentUpdated();
    }
  };

  const toggleExpand = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getFilteredComments = () => {
    if (filterType === 'all') return data;
    if (filterType === 'resolved') return data.filter(c => c.is_resolved);
    if (filterType === 'unresolved') return data.filter(c => !c.is_resolved);
    return data;
  };

  if (loading) return <ReviewLoading size="sm" text="Loading comments..." />;
  if (error) return <div className="comment-list-error">Failed to load comments</div>;

  const filteredComments = getFilteredComments();
  const topLevelComments = filteredComments.filter(c => !c.parent_comment);

  return (
    <div className="comment-list">
      <div className="comment-list-header">
        <h3 className="comment-list-title">
          Comments ({topLevelComments.length})
        </h3>
        <div className="comment-list-actions">
          <button
            className="comment-list-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filter
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="comment-list-filters">
          <button
            className={`comment-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`comment-filter-btn ${filterType === 'unresolved' ? 'active' : ''}`}
            onClick={() => setFilterType('unresolved')}
          >
            Unresolved
          </button>
          <button
            className={`comment-filter-btn ${filterType === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilterType('resolved')}
          >
            Resolved
          </button>
        </div>
      )}

      {canManage && (
        <div className="comment-list-form">
          <CommentForm
            contentType={contentType}
            objectId={objectId}
            onSuccess={(comment) => {
              fetchCommentsForObject(contentType, objectId);
              if (onCommentAdded) onCommentAdded(comment);
            }}
            placeholder="Add a comment..."
          />
        </div>
      )}

      {topLevelComments.length === 0 ? (
        <ReviewEmptyState
          title="No Comments"
          description="Be the first to add a comment."
          icon="💬"
        />
      ) : (
        <div className="comment-list-items">
          {topLevelComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              contentType={contentType}
              objectId={objectId}
              onReply={handleReply}
              onEdit={handleEdit}
              onResolve={handleResolve}
              onUnresolve={handleUnresolve}
              onDelete={handleDelete}
              isExpanded={expandedComments[comment.id] || false}
              onToggleExpand={() => toggleExpand(comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
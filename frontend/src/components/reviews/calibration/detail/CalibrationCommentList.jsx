// src/components/reviews/calibration/detail/CalibrationCommentList.jsx
import React, { useEffect } from 'react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import { User, Clock } from 'lucide-react';

const CalibrationCommentList = ({ sessionId }) => {
  const { fetchComments, sessionComments, commentLoading } = useCalibration();

  useEffect(() => {
    if (sessionId) {
      fetchComments(sessionId);
    }
  }, [sessionId, fetchComments]);

  if (commentLoading) return <ReviewLoading size="sm" text="Loading comments..." />;

  if (!sessionComments || sessionComments.length === 0) {
    return (
      <div className="calibration-comment-list-empty">
        No comments yet
      </div>
    );
  }

  return (
    <div className="calibration-comment-list">
      {sessionComments.map((comment) => (
        <div key={comment.id} className="calibration-comment-item">
          <div className="calibration-comment-item-header">
            <div className="calibration-comment-item-author">
              <User size={14} />
              <span>{comment.author_name}</span>
            </div>
            <span className="calibration-comment-item-date">
              <Clock size={12} />
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="calibration-comment-item-text">{comment.comment}</p>
          {comment.replies && comment.replies.length > 0 && (
            <div className="calibration-comment-item-replies">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="calibration-comment-item-reply">
                  <div className="calibration-comment-item-reply-header">
                    <span className="calibration-comment-item-reply-author">{reply.author_name}</span>
                    <span className="calibration-comment-item-reply-date">
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="calibration-comment-item-reply-text">{reply.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalibrationCommentList;
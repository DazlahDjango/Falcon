// src/components/reviews/calibration/detail/CalibrationCommentForm.jsx
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';

const CalibrationCommentForm = ({ sessionId }) => {
  const { addComment, canManage } = useCalibration();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(sessionId, comment);
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) return null;

  return (
    <form className="calibration-comment-form" onSubmit={handleSubmit}>
      <div className="calibration-comment-form-group">
        <textarea
          className="calibration-comment-form-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-sm calibration-comment-form-submit"
        disabled={isSubmitting || !comment.trim()}
      >
        <Send size={16} />
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default CalibrationCommentForm;
// src/components/reviews/feedback/summaries/FeedbackSummaryShare.jsx
import React, { useState } from 'react';
import { Share2, CheckCircle, Mail, User, Send } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const FeedbackSummaryShare = ({ summary }) => {
  const { shareSummary, canManage } = useFeedback();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState('employee');

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareSummary(summary.id);
      setShowConfirm(false);
    } finally {
      setIsSharing(false);
    }
  };

  if (!canManage || summary.is_shared_with_subject) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setShowConfirm(true)}
      >
        <Share2 size={18} />
        Share Summary
      </button>

      {showConfirm && (
        <div className="feedback-summary-share-modal">
          <div className="feedback-summary-share-modal-content">
            <h3 className="feedback-summary-share-title">Share Feedback Summary</h3>
            <p className="feedback-summary-share-subtitle">
              This will share the feedback summary with {summary.subject_name}.
            </p>

            <div className="feedback-summary-share-options">
              <label className="feedback-summary-share-option">
                <input
                  type="radio"
                  value="employee"
                  checked={shareMethod === 'employee'}
                  onChange={(e) => setShareMethod(e.target.value)}
                />
                <div className="feedback-summary-share-option-content">
                  <User size={20} />
                  <div>
                    <span className="feedback-summary-share-option-label">Share with Employee</span>
                    <span className="feedback-summary-share-option-desc">
                      The employee will receive an email with the summary
                    </span>
                  </div>
                </div>
              </label>
              <label className="feedback-summary-share-option">
                <input
                  type="radio"
                  value="manager"
                  checked={shareMethod === 'manager'}
                  onChange={(e) => setShareMethod(e.target.value)}
                />
                <div className="feedback-summary-share-option-content">
                  <Mail size={20} />
                  <div>
                    <span className="feedback-summary-share-option-label">Share with Manager</span>
                    <span className="feedback-summary-share-option-desc">
                      The manager will receive a detailed report
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <div className="feedback-summary-share-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Send size={18} />
                {isSharing ? 'Sharing...' : 'Share Summary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackSummaryShare;
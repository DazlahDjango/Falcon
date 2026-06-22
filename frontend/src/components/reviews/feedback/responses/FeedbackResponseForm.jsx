// src/components/reviews/feedback/responses/FeedbackResponseForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Star } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';

const FeedbackResponseForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { submitResponse, fetchRequest, selectedRequest, requestLoading, requestError } = useFeedback();
  const [formData, setFormData] = useState({
    overall_rating: null,
    strengths: '',
    areas_for_improvement: '',
    specific_examples: '',
    suggestions: '',
    additional_comments: '',
    ratings: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequest(requestId);
    }
  }, [requestId, fetchRequest]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, overall_rating: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitResponse(requestId, formData);
      navigate('/reviews/feedback/requests');
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestLoading) return <ReviewLoading size="lg" text="Loading feedback request..." />;
  if (requestError) return <ReviewError error={requestError} onRetry={() => fetchRequest(requestId)} />;
  if (!selectedRequest) return null;

  return (
    <div className="feedback-response-form">
      <div className="feedback-response-form-header">
        <button className="feedback-response-form-back" onClick={() => navigate('/reviews/feedback/requests')}>
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <h1 className="feedback-response-form-title">Submit Feedback</h1>
      </div>

      <div className="feedback-response-form-info">
        <div className="feedback-response-form-info-item">
          <span className="feedback-response-form-info-label">Subject</span>
          <span className="feedback-response-form-info-value">{selectedRequest.subject_name}</span>
        </div>
        <div className="feedback-response-form-info-item">
          <span className="feedback-response-form-info-label">Reviewer Type</span>
          <span className="feedback-response-form-info-value">{selectedRequest.reviewer_type_display}</span>
        </div>
        <div className="feedback-response-form-info-item">
          <span className="feedback-response-form-info-label">Due Date</span>
          <span className="feedback-response-form-info-value">
            {new Date(selectedRequest.due_date).toLocaleDateString()}
          </span>
        </div>
        {selectedRequest.is_anonymous && (
          <div className="feedback-response-form-info-item">
            <span className="feedback-response-form-info-badge anonymous">Anonymous</span>
          </div>
        )}
        {selectedRequest.is_required && (
          <div className="feedback-response-form-info-item">
            <span className="feedback-response-form-info-badge required">Required</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="feedback-response-form-content">
        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Overall Rating</label>
          <div className="feedback-response-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`feedback-response-star ${formData.overall_rating >= star ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                <Star
                  size={32}
                  fill={formData.overall_rating >= star ? '#f59e0b' : 'none'}
                  color={formData.overall_rating >= star ? '#f59e0b' : '#d1d5db'}
                />
              </button>
            ))}
            {formData.overall_rating && (
              <span className="feedback-response-rating-label">{formData.overall_rating}/5</span>
            )}
          </div>
        </div>

        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Strengths</label>
          <textarea
            className="feedback-response-form-textarea"
            value={formData.strengths}
            onChange={(e) => handleChange('strengths', e.target.value)}
            placeholder="What are the subject's key strengths?"
            rows={4}
          />
        </div>

        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Areas for Improvement</label>
          <textarea
            className="feedback-response-form-textarea"
            value={formData.areas_for_improvement}
            onChange={(e) => handleChange('areas_for_improvement', e.target.value)}
            placeholder="What areas could be improved?"
            rows={4}
          />
        </div>

        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Specific Examples</label>
          <textarea
            className="feedback-response-form-textarea"
            value={formData.specific_examples}
            onChange={(e) => handleChange('specific_examples', e.target.value)}
            placeholder="Provide specific examples to support your feedback..."
            rows={4}
          />
        </div>

        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Suggestions</label>
          <textarea
            className="feedback-response-form-textarea"
            value={formData.suggestions}
            onChange={(e) => handleChange('suggestions', e.target.value)}
            placeholder="What suggestions do you have?"
            rows={3}
          />
        </div>

        <div className="feedback-response-form-group">
          <label className="feedback-response-form-label">Additional Comments</label>
          <textarea
            className="feedback-response-form-textarea"
            value={formData.additional_comments}
            onChange={(e) => handleChange('additional_comments', e.target.value)}
            placeholder="Any additional comments?"
            rows={3}
          />
        </div>

        <div className="feedback-response-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/feedback/requests')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            <Send size={18} />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackResponseForm;
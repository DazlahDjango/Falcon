// src/components/reviews/feedback/requests/FeedbackRequestCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import FeedbackRequestForm from './FeedbackRequestForm';

const FeedbackRequestCreate = () => {
  const navigate = useNavigate();
  const { createRequest, loading } = useFeedback();
  const [formData, setFormData] = useState({
    subject: '',
    reviewer: '',
    review_cycle: '',
    reviewer_type: 'peer',
    is_anonymous: true,
    is_required: false,
    due_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRequest(formData);
      navigate('/reviews/feedback/requests');
    } catch (error) {
      console.error('Failed to create feedback request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating feedback request..." />;

  return (
    <div className="feedback-request-create">
      <div className="feedback-request-create-header">
        <button className="feedback-request-create-back" onClick={() => navigate('/reviews/feedback/requests')}>
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <h1 className="feedback-request-create-title">Create Feedback Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="feedback-request-create-form">
        <FeedbackRequestForm
          data={formData}
          onChange={handleChange}
        />

        <div className="feedback-request-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/feedback/requests')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.subject || !formData.reviewer || !formData.review_cycle || !formData.due_date}
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackRequestCreate;
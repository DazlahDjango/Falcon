// src/components/reviews/feedback/responses/FeedbackResponseList.jsx
import React, { useEffect } from 'react';
import { useFeedback } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewEmptyState } from '../../common';
import FeedbackResponseView from './FeedbackResponseView';

const FeedbackResponseList = ({ subjectId }) => {
  const { fetchResponsesForSubject, responseData, responseLoading } = useFeedback();

  useEffect(() => {
    if (subjectId) {
      fetchResponsesForSubject(subjectId);
    }
  }, [subjectId, fetchResponsesForSubject]);

  if (responseLoading) return <ReviewLoading size="md" text="Loading responses..." />;

  if (!responseData || responseData.length === 0) {
    return (
      <ReviewEmptyState
        title="No Responses"
        description="No feedback responses have been submitted yet."
        icon="📝"
      />
    );
  }

  return (
    <div className="feedback-response-list">
      <div className="feedback-response-list-header">
        <h3 className="feedback-response-list-title">
          Feedback Responses ({responseData.length})
        </h3>
      </div>
      <div className="feedback-response-list-items">
        {responseData.map((response) => (
          <FeedbackResponseView key={response.id} response={response} />
        ))}
      </div>
    </div>
  );
};

export default FeedbackResponseList;
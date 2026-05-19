// src/pages/reviews/ReviewQueuePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisorReview } from '../../hooks/reviews';
import { ReviewQueue } from '../../components/reviews/assessment';
import { REVIEW_ROUTES } from '../../config/constants';

const ReviewQueuePage = () => {
    const navigate = useNavigate();
    const { reviewQueue, fetchReviewQueue, loading } = useSupervisorReview();

    useEffect(() => {
        fetchReviewQueue();
    }, []);

    const handleReview = (reviewId) => {
        navigate(REVIEW_ROUTES.REVIEW_SUPERVISOR_REVIEW_VIEW(reviewId));
    };

    const handleView = (reviewId) => {
        navigate(REVIEW_ROUTES.REVIEW_SUPERVISOR_REVIEW_VIEW(reviewId));
    };

    return (
        <ReviewQueue 
            reviews={reviewQueue}
            loading={loading}
            onReview={handleReview}
            onView={handleView}
            isManager={true}
            title="My Review Queue"
        />
    );
};

export default ReviewQueuePage;
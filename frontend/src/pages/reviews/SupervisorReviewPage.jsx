// src/pages/reviews/SupervisorReviewPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupervisorReview, useCompetencies } from '../../hooks/reviews';
import { SupervisorReviewForm, SupervisorReviewView } from '../../components/reviews/assessment';
import { REVIEW_ROUTES } from '../../config/constants';

const SupervisorReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getReview, saveReview, submitReview, loading, submitting } = useSupervisorReview();
    const { competencies, fetchCompetencies, getRatingsForSupervisorReview, competencyRatings } = useCompetencies();
    const [review, setReview] = useState(null);
    const [selfAssessment, setSelfAssessment] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        const data = await getReview(id);
        setReview(data);
        setSelfAssessment(data.self_assessment);
        await fetchCompetencies({ is_active: true });
        await getRatingsForSupervisorReview(id);
        setIsSubmitted(data.status === 'submitted' || data.status === 'approved');
    };

    const handleSaveDraft = async (data) => {
        const result = await saveReview(data);
        if (result) {
            alert('Draft saved successfully');
        }
    };

    const handleSubmit = async (data) => {
        const result = await saveReview(data);
        if (result) {
            await submitReview(result.id);
            alert('Review submitted successfully');
            navigate(REVIEW_ROUTES.REVIEW_QUEUE);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading review...</div>;
    }

    if (!review) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Review Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The review you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_QUEUE)}>Back to Queue</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Supervisor Review</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {review.employee?.name || review.employee_name} - {review.review_cycle?.name || review.review_cycle_name}
                </p>
            </div>
            
            <SupervisorReviewForm 
                review={review}
                selfAssessment={selfAssessment}
                competencies={competencies}
                ratings={competencyRatings}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isSubmitting={submitting}
                readOnly={isSubmitted}
            />
        </div>
    );
};

export default SupervisorReviewPage;
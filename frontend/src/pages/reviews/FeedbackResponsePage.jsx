// src/pages/reviews/FeedbackResponsePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeedback } from '../../hooks/reviews';
import { FeedbackResponseForm } from '../../components/reviews/feedback';
import { REVIEW_ROUTES } from '../../config/constants';

const FeedbackResponsePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRequest, submitResponse, loading } = useFeedback();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        const data = await getRequest(id);
        setRequest(data);
    };

    const handleSubmit = async (data) => {
        await submitResponse(id, data);
        alert('Feedback submitted successfully');
        navigate(REVIEW_ROUTES.REVIEW_FEEDBACK);
    };

    const handleCancel = () => {
        navigate(REVIEW_ROUTES.REVIEW_FEEDBACK);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading feedback request...</div>;
    }

    if (!request) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Request Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The feedback request you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_FEEDBACK)}>Back to Feedback</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Submit Feedback</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    For: {request.subject_name || request.subject?.name}
                </p>
            </div>
            <FeedbackResponseForm 
                request={request}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={loading}
            />
        </div>
    );
};

export default FeedbackResponsePage;
// src/pages/reviews/SelfAssessmentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelfAssessment, useCompetencies } from '../../hooks/reviews';
import { SelfAssessmentForm, SelfAssessmentView } from '../../components/reviews/assessment';
import { REVIEW_ROUTES } from '../../config/constants';

const SelfAssessmentPage = () => {
    const navigate = useNavigate();
    const { myAssessment, saveAssessment, submitAssessment, loading, submitting } = useSelfAssessment();
    const { competencies, fetchCompetencies, getRatingsForSelfAssessment, competencyRatings } = useCompetencies();
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchCompetencies({ is_active: true });
        if (myAssessment?.id) {
            await getRatingsForSelfAssessment(myAssessment.id);
        }
        setIsSubmitted(myAssessment?.status === 'submitted');
    };

    const handleSaveDraft = async (data) => {
        const result = await saveAssessment(data);
        if (result) {
            alert('Draft saved successfully');
        }
    };

    const handleSubmit = async (data) => {
        const result = await saveAssessment(data);
        if (result) {
            await submitAssessment(result.id);
            alert('Self assessment submitted successfully');
            navigate(REVIEW_ROUTES.REVIEW_DASHBOARD);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading self assessment...</div>;
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Self Assessment</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Evaluate your performance for the current review cycle</p>
            </div>
            
            <SelfAssessmentForm 
                assessment={myAssessment}
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

export default SelfAssessmentPage;
// src/pages/reviews/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCycles, useSelfAssessment, useSupervisorReview, useFinalRatings, usePIPs } from '../../hooks/reviews';
import { REVIEW_ROUTES } from '../../config/constants';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { activeCycle, fetchActiveCycle, loading: cyclesLoading } = useCycles();
    const { myAssessment, fetchMyAssessment, loading: assessmentLoading } = useSelfAssessment();
    const { reviewQueue, fetchReviewQueue, loading: queueLoading } = useSupervisorReview();
    const { myRating, fetchMyRating, loading: ratingLoading } = useFinalRatings();
    const { myPIPs, fetchMyPIPs, loading: pipsLoading } = usePIPs();
    
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchActiveCycle();
        fetchMyAssessment();
        fetchReviewQueue();
        fetchMyRating();
        fetchMyPIPs();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const isLoading = cyclesLoading || assessmentLoading || queueLoading || ratingLoading || pipsLoading;

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading dashboard...</div>;
    }

    const activePIPs = myPIPs?.filter(p => p.status === 'active') || [];

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Performance Dashboard</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Welcome back! Here's your performance overview</p>
            </div>

            {activeCycle && (
                <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                    <strong>Active Review Cycle:</strong> {activeCycle.name}
                    <span style={{ marginLeft: '1rem' }}>
                        {new Date(activeCycle.end_date) > new Date() 
                            ? `Ends in ${Math.ceil((new Date(activeCycle.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days`
                            : 'Cycle has ended'}
                    </span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => navigate(REVIEW_ROUTES.REVIEW_SELF_ASSESSMENT)}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Self Assessment</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                        {myAssessment?.status === 'submitted' ? '✓ Submitted' : myAssessment?.status === 'draft' ? 'In Progress' : 'Not Started'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Click to {myAssessment?.status === 'submitted' ? 'view' : 'complete'}</div>
                </div>

                {(userRole === 'manager' || userRole === 'admin' || userRole === 'hr') && (
                    <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => navigate(REVIEW_ROUTES.REVIEW_QUEUE)}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Reviews</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{reviewQueue?.length || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Awaiting your review</div>
                    </div>
                )}

                {myRating && (
                    <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => navigate(REVIEW_ROUTES.REVIEW_FINAL_RATINGS)}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Final Rating</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: myRating.final_score >= 80 ? '#10b981' : myRating.final_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                            {myRating.final_score ? `${myRating.final_score}%` : 'Pending'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>{myRating.final_rating_label || 'Not yet rated'}</div>
                    </div>
                )}

                {activePIPs.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => navigate(REVIEW_ROUTES.REVIEW_PIPS)}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active PIPs</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{activePIPs.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Performance Improvement Plans</div>
                    </div>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_SELF_ASSESSMENT)}>
                        {myAssessment?.status === 'submitted' ? 'View Self Assessment' : 'Complete Self Assessment'}
                    </button>
                    {(userRole === 'manager' || userRole === 'admin' || userRole === 'hr') && (
                        <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_QUEUE)}>
                            Review Team ({reviewQueue?.length || 0})
                        </button>
                    )}
                    <button className="btn-outline" onClick={() => navigate(REVIEW_ROUTES.REVIEW_FINAL_RATINGS)}>
                        View Final Rating
                    </button>
                    <button className="btn-outline" onClick={() => navigate(REVIEW_ROUTES.REVIEW_CYCLES)}>
                        Browse Cycles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
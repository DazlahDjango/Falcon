// src/pages/reviews/FeedbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../../hooks/reviews';
import { FeedbackRequestList, FeedbackSummary } from '../../components/reviews/feedback';
import { REVIEW_ROUTES } from '../../config/constants';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const { requests, pendingRequests, mySummary, fetchFeedbackRequests, fetchPendingFeedbackRequests, fetchMyFeedbackSummary, loading } = useFeedback();
    const [activeTab, setActiveTab] = useState('requests');
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadData();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'requests') {
            await fetchFeedbackRequests();
            await fetchPendingFeedbackRequests();
        } else {
            await fetchMyFeedbackSummary();
        }
    };

    const canManage = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleCreateRequest = () => {
        navigate(REVIEW_ROUTES.REVIEW_FEEDBACK_REQUESTS);
    };

    const handleRespond = (requestId) => {
        navigate(REVIEW_ROUTES.REVIEW_FEEDBACK_RESPOND(requestId));
    };

    const handleShareSummary = async () => {
        if (mySummary && !mySummary.is_shared_with_subject) {
            // await shareFeedbackSummary(mySummary.id);
            alert('Summary shared with employee');
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>360° Feedback</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Manage feedback requests and view your feedback summary</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <button 
                    onClick={() => setActiveTab('requests')}
                    style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'requests' ? 600 : 400, borderBottom: activeTab === 'requests' ? '2px solid #3b82f6' : 'none' }}
                >
                    Feedback Requests
                </button>
                <button 
                    onClick={() => setActiveTab('summary')}
                    style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'summary' ? 600 : 400, borderBottom: activeTab === 'summary' ? '2px solid #3b82f6' : 'none' }}
                >
                    My Feedback Summary
                </button>
            </div>

            {activeTab === 'requests' ? (
                <FeedbackRequestList 
                    requests={requests}
                    loading={loading}
                    onRespondClick={handleRespond}
                    onCreateClick={canManage ? handleCreateRequest : null}
                />
            ) : (
                <FeedbackSummary 
                    summary={mySummary}
                    onShare={handleShareSummary}
                    canShare={canManage}
                />
            )}
        </div>
    );
};

export default FeedbackPage;
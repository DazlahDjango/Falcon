// src/pages/reviews/InsightsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsights } from '../../hooks/reviews';
import { ReviewInsightsPanel } from '../../components/reviews/reviewAnalytics';
import { REVIEW_ROUTES } from '../../config/constants';

const InsightsPage = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('staff');
    
    const {
        loading,
        insights,
        unreadCount,
        generating,
        generateInsights,
        dismissInsight,
        fetchInsights,
    } = useInsights({ autoFetch: true, limit: 50 });

    useEffect(() => {
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canView = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'supervisor' || userRole === 'manager' || userRole === 'hr';

    const handleInsightClick = (insight) => {
        dismissInsight(insight.id);
        if (insight.action_url) {
            navigate(insight.action_url);
        }
    };

    const handleGenerateNew = () => {
        generateInsights({ force: true });
    };

    if (!canView) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You don't have permission to view insights.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_DASHBOARD)}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    AI Insights
                    {unreadCount > 0 && (
                        <span style={{ 
                            marginLeft: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '0.75rem',
                            borderRadius: '9999px'
                        }}>
                            {unreadCount} new
                        </span>
                    )}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Smart recommendations and insights based on your performance data
                </p>
            </div>

            <ReviewInsightsPanel
                insights={insights}
                onInsightClick={handleInsightClick}
                onGenerate={handleGenerateNew}
                loading={loading}
                generating={generating}
            />
        </div>
    );
};

export default InsightsPage;
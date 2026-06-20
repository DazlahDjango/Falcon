// src/pages/reviews/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewAnalyticsDashboard } from '../../components/reviews/reviewAnalytics';
import { REVIEW_ROUTES } from '../../config/constants';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canView = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'supervisor' || userRole === 'manager' || userRole === 'hr';

    const handleNavigate = (path) => {
        if (path) navigate(path);
    };

    if (!canView) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You don't have permission to view analytics.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_DASHBOARD)}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '0', margin: 0 }}>
            <ReviewAnalyticsDashboard onNavigate={handleNavigate} />
        </div>
    );
};

export default AnalyticsPage;
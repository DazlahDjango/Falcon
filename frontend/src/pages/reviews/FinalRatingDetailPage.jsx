// src/pages/reviews/FinalRatingDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinalRatings } from '../../hooks/reviews';
import { FinalRatingDetail } from '../../components/reviews/finalRating';
import { REVIEW_ROUTES } from '../../config/constants';

const FinalRatingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRating, approveRating, lockRating, calibrateRating, loading } = useFinalRatings();
    const [rating, setRating] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadRating();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [id]);

    const loadRating = async () => {
        const data = await getRating(id);
        setRating(data);
    };

    const isHr = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' ;

    const handleApprove = async () => {
        if (window.confirm('Are you sure you want to approve this rating?')) {
            await approveRating(id);
            loadRating();
        }
    };

    const handleLock = async () => {
        if (window.confirm('Are you sure you want to lock this rating? This action cannot be undone.')) {
            await lockRating(id);
            loadRating();
        }
    };

    const handleCalibrate = async () => {
        const newScore = prompt('Enter calibrated score (0-100):', rating.final_score);
        if (newScore && !isNaN(newScore)) {
            const reason = prompt('Reason for calibration:');
            if (reason) {
                await calibrateRating(id, parseFloat(newScore), reason);
                loadRating();
            }
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading rating details...</div>;
    }

    if (!rating) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Rating Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The rating you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_FINAL_RATINGS)}>Back to Ratings</button>
            </div>
        );
    }

    return (
        <FinalRatingDetail 
            rating={rating}
            onApprove={handleApprove}
            onLock={handleLock}
            onCalibrate={handleCalibrate}
            canManage={isHr}
            isHr={isHr}
        />
    );
};

export default FinalRatingDetailPage;
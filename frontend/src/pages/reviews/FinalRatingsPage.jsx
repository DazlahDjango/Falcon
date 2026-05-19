// src/pages/reviews/FinalRatingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinalRatings } from '../../hooks/reviews';
import { FinalRatingList } from '../../components/reviews/finalRating';
import { REVIEW_ROUTES } from '../../config/constants';

const FinalRatingsPage = () => {
    const navigate = useNavigate();
    const { finalRatings, fetchFinalRatings, loading } = useFinalRatings();
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchFinalRatings();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const handleRatingClick = (id) => {
        navigate(REVIEW_ROUTES.REVIEW_FINAL_RATINGS_DETAIL(id));
    };

    const handleExport = async () => {
        // Export functionality
        alert('Export feature coming soon');
    };

    return (
        <FinalRatingList 
            ratings={finalRatings}
            loading={loading}
            onRatingClick={handleRatingClick}
            onExport={handleExport}
        />
    );
};

export default FinalRatingsPage;
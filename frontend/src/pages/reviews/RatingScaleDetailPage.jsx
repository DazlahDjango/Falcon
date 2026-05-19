// src/pages/reviews/RatingScaleDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRatingScales } from '../../hooks/reviews';
import { RatingScaleDetail } from '../../components/reviews/ratingScale';
import { REVIEW_ROUTES } from '../../config/constants';

const RatingScaleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRatingScale, deleteRatingScale, setDefault, loading } = useRatingScales();
    const [scale, setScale] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadScale();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [id]);

    const loadScale = async () => {
        const data = await getRatingScale(id);
        setScale(data);
    };

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleEdit = () => {
        navigate(REVIEW_ROUTES.RATING_SCALES_EDIT(id));
    };

    const handleSetDefault = async () => {
        await setDefault(id);
        loadScale();
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this rating scale?')) {
            await deleteRatingScale(id);
            navigate(REVIEW_ROUTES.RATING_SCALES);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading rating scale details...</div>;
    }

    if (!scale) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Rating Scale Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The rating scale you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.RATING_SCALES)}>Back to Rating Scales</button>
            </div>
        );
    }

    return (
        <RatingScaleDetail 
            ratingScale={scale}
            onEdit={handleEdit}
            onSetDefault={handleSetDefault}
            onDelete={handleDelete}
            canManage={canManage}
        />
    );
};

export default RatingScaleDetailPage;
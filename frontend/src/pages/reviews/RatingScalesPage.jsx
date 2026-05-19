// src/pages/reviews/RatingScalesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRatingScales } from '../../hooks/reviews';
import { RatingScaleList, RatingScaleForm } from '../../components/reviews/ratingScale';
import { REVIEW_ROUTES } from '../../config/constants';

const RatingScalesPage = () => {
    const navigate = useNavigate();
    const { ratingScales, createRatingScale, updateRatingScale, deleteRatingScale, setDefault, fetchRatingScales, loading } = useRatingScales();
    const [showForm, setShowForm] = useState(false);
    const [editingScale, setEditingScale] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchRatingScales();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleCreateClick = () => {
        setEditingScale(null);
        setShowForm(true);
    };

    const handleEdit = (id) => {
        const scale = ratingScales.find(s => s.id === id);
        setEditingScale(scale);
        setShowForm(true);
    };

    const handleSubmit = async (data) => {
        if (editingScale) {
            await updateRatingScale(editingScale.id, data);
        } else {
            await createRatingScale(data);
        }
        setShowForm(false);
        setEditingScale(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingScale(null);
    };

    const handleScaleClick = (id) => {
        navigate(REVIEW_ROUTES.RATING_SCALES_DETAIL(id));
    };

    const handleSetDefault = async (id) => {
        await setDefault(id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rating scale?')) {
            await deleteRatingScale(id);
        }
    };

    if (showForm) {
        return (
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{editingScale ? 'Edit Rating Scale' : 'Create New Rating Scale'}</h1>
                </div>
                <RatingScaleForm initialData={editingScale || {}} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        );
    }

    return (
        <RatingScaleList 
            ratingScales={ratingScales}
            loading={loading}
            onScaleClick={handleScaleClick}
            onCreateClick={canManage ? handleCreateClick : null}
            onSetDefault={canManage ? handleSetDefault : null}
            onDelete={canManage ? handleDelete : null}
            onEdit={canManage ? handleEdit : null}
            canManage={canManage}
        />
    );
};

export default RatingScalesPage;
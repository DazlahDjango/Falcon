// src/pages/reviews/CalibrationSessionPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalibration, useCycles } from '../../hooks/reviews';
import { CalibrationSessionForm } from '../../components/reviews/calibration';
import { REVIEW_ROUTES } from '../../config/constants';

const CalibrationSessionPage = () => {
    const navigate = useNavigate();
    const { createSession, loading } = useCalibration();
    const { cycles, fetchCycles } = useCycles();
    const [managers, setManagers] = useState([]);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchCycles();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive';

    const handleSubmit = async (data) => {
        await createSession(data);
        alert('Calibration session created successfully');
        navigate(REVIEW_ROUTES.REVIEW_CALIBRATION);
    };

    const handleCancel = () => {
        navigate(REVIEW_ROUTES.REVIEW_CALIBRATION);
    };

    if (!canManage) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You don't have permission to create calibration sessions.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_DASHBOARD)}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Create Calibration Session</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Schedule a calibration session for managers</p>
            </div>
            <CalibrationSessionForm 
                cycles={cycles}
                managers={managers}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={loading}
            />
        </div>
    );
};

export default CalibrationSessionPage;
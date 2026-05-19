// src/pages/reviews/CalibrationPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalibration } from '../../hooks/reviews';
import { CalibrationSessionList } from '../../components/reviews/calibration';
import { REVIEW_ROUTES } from '../../config/constants';

const CalibrationPage = () => {
    const navigate = useNavigate();
    const { sessions, fetchSessions, loading } = useCalibration();
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchSessions();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive';

    const handleSessionClick = (id) => {
        navigate(REVIEW_ROUTES.REVIEW_CALIBRATION_SESSION_DETAIL(id));
    };

    const handleCreateClick = () => {
        navigate(REVIEW_ROUTES.REVIEW_CALIBRATION_SESSION_CREATE);
    };

    return (
        <CalibrationSessionList 
            sessions={sessions}
            loading={loading}
            onSessionClick={handleSessionClick}
            onCreateClick={canManage ? handleCreateClick : null}
        />
    );
};

export default CalibrationPage;
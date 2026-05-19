// src/pages/reviews/CalibrationSessionDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalibration } from '../../hooks/reviews';
import { CalibrationSessionDetail } from '../../components/reviews/calibration';
import { REVIEW_ROUTES } from '../../config/constants';

const CalibrationSessionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getSession, startSession, completeSession, adjustRating, addComment, getSessionReport, loading } = useCalibration();
    const [session, setSession] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        loadSession();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, [id]);

    const loadSession = async () => {
        const data = await getSession(id);
        setSession(data);
    };

    const canManage = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive';
    const isFacilitator = session?.facilitator_id === localStorage.getItem('user_id') || canManage;
    const isParticipant = session?.participants?.some(p => p.id === localStorage.getItem('user_id')) || isFacilitator;

    const handleStart = async () => {
        await startSession(id);
        loadSession();
    };

    const handleComplete = async () => {
        await completeSession(id);
        loadSession();
    };

    const handleAdjustRating = async (ratingId, beforeScore, afterScore, reason) => {
        await adjustRating(id, ratingId, beforeScore, afterScore, reason);
        loadSession();
    };

    const handleSendMessage = async (message) => {
        // WebSocket send
        setMessages([...messages, { message, sender: 'current_user', timestamp: new Date() }]);
    };

    const handleRefresh = () => {
        loadSession();
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>Loading calibration session...</div>;
    }

    if (!session) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Session Not Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>The calibration session you're looking for doesn't exist.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_CALIBRATION)}>Back to Calibration</button>
            </div>
        );
    }

    return (
        <CalibrationSessionDetail 
            session={session}
            ratings={ratings}
            messages={messages}
            onStart={handleStart}
            onComplete={handleComplete}
            onAdjustRating={handleAdjustRating}
            onSendMessage={handleSendMessage}
            onRefresh={handleRefresh}
            canManage={canManage}
            isFacilitator={isFacilitator}
            isParticipant={isParticipant}
        />
    );
};

export default CalibrationSessionDetailPage;
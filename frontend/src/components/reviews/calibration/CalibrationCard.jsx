// src/components/reviews/calibration/CalibrationCard.jsx
import React from 'react';
import './calibration.css';

const CalibrationCard = ({ session, onClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusClass = () => {
        switch (session.status) {
            case 'active': return 'calibration-status-active';
            case 'in_progress': return 'calibration-status-in_progress';
            case 'completed': return 'calibration-status-completed';
            case 'cancelled': return 'calibration-status-cancelled';
            default: return 'calibration-status-active';
        }
    };

    const getStatusLabel = () => {
        switch (session.status) {
            case 'active': return 'Scheduled';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return session.status;
        }
    };

    return (
        <div className="calibration-card" onClick={() => onClick?.(session.id)}>
            <div className="calibration-card-header">
                <h3 className="calibration-card-title">{session.name}</h3>
                <span className={`calibration-status-badge ${getStatusClass()}`}>
                    {getStatusLabel()}
                </span>
            </div>
            <div className="calibration-card-date">
                📅 {formatDate(session.scheduled_date)}
            </div>
            <div className="calibration-card-participants">
                👥 {session.participants_count || session.participants?.length || 0} participants
            </div>
            {session.facilitator_name && (
                <div className="calibration-card-participants" style={{ fontSize: '0.75rem' }}>
                    Facilitator: {session.facilitator_name}
                </div>
            )}
        </div>
    );
};

export default CalibrationCard;
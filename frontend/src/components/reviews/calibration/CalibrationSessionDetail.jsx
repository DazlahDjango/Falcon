// src/components/reviews/calibration/CalibrationSessionDetail.jsx
import React from 'react';
import './calibration.css';
import CalibrationRatingAdjustment from './CalibrationRatingAdjustment';
import CalibrationChat from './CalibrationChat';

const CalibrationSessionDetail = ({ 
    session, 
    ratings = [], 
    messages = [],
    adjustments = [],
    onStart,
    onComplete,
    onAdjustRating,
    onSendMessage,
    onAddComment,
    onRefresh,
    canManage = false,
    isFacilitator = false,
    isParticipant = false
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const canStart = session.status === 'active' && (isFacilitator || canManage);
    const canComplete = session.status === 'in_progress' && (isFacilitator || canManage);

    if (!session) {
        return <div className="calibration-loading">Loading session details...</div>;
    }

    return (
        <div className="calibration-detail">
            <div className="calibration-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="calibration-title">{session.name}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className={`calibration-status-badge calibration-status-${session.status}`}>
                                {session.status_display || session.status}
                            </span>
                        </div>
                    </div>
                    <div className="calibration-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                        {canStart && (
                            <button className="btn-success" onClick={() => onStart(session.id)}>
                                Start Session
                            </button>
                        )}
                        {canComplete && (
                            <button className="btn-primary" onClick={() => onComplete(session.id)}>
                                Complete Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="calibration-detail-section">
                <h3 className="calibration-section-title">Session Information</h3>
                <div className="calibration-info-grid">
                    <div className="calibration-info-item">
                        <span className="calibration-info-label">Review Cycle</span>
                        <span className="calibration-info-value">{session.review_cycle_name}</span>
                    </div>
                    <div className="calibration-info-item">
                        <span className="calibration-info-label">Type</span>
                        <span className="calibration-info-value">{session.session_type_display}</span>
                    </div>
                    <div className="calibration-info-item">
                        <span className="calibration-info-label">Scheduled</span>
                        <span className="calibration-info-value">{formatDate(session.scheduled_date)}</span>
                    </div>
                    {session.actual_start_time && (
                        <div className="calibration-info-item">
                            <span className="calibration-info-label">Started</span>
                            <span className="calibration-info-value">{formatDate(session.actual_start_time)}</span>
                        </div>
                    )}
                    {session.actual_end_time && (
                        <div className="calibration-info-item">
                            <span className="calibration-info-label">Ended</span>
                            <span className="calibration-info-value">{formatDate(session.actual_end_time)}</span>
                        </div>
                    )}
                    <div className="calibration-info-item">
                        <span className="calibration-info-label">Facilitator</span>
                        <span className="calibration-info-value">{session.facilitator_name || 'Not assigned'}</span>
                    </div>
                    <div className="calibration-info-item">
                        <span className="calibration-info-label">Participants</span>
                        <span className="calibration-info-value">{session.participants_count || 0} managers</span>
                    </div>
                </div>
            </div>

            {session.description && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Description</h3>
                    <p style={{ margin: 0 }}>{session.description}</p>
                </div>
            )}

            {session.agenda && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Agenda</h3>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{session.agenda}</pre>
                </div>
            )}

            {(isFacilitator || canManage || session.status === 'in_progress') && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Rating Adjustments</h3>
                    <CalibrationRatingAdjustment 
                        ratings={ratings}
                        adjustments={adjustments}
                        onAdjust={onAdjustRating}
                        onRefresh={onRefresh}
                        isFacilitator={isFacilitator || canManage}
                    />
                </div>
            )}

            {(isParticipant || isFacilitator || canManage) && session.status === 'in_progress' && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Live Discussion</h3>
                    <CalibrationChat 
                        messages={messages}
                        onSendMessage={onSendMessage}
                        currentUser={{ email: 'current_user@example.com' }}
                        isConnected={true}
                    />
                </div>
            )}

            {session.decisions && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Decisions Made</h3>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{session.decisions}</p>
                </div>
            )}

            {session.notes && (
                <div className="calibration-detail-section">
                    <h3 className="calibration-section-title">Notes</h3>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{session.notes}</p>
                </div>
            )}
        </div>
    );
};

export default CalibrationSessionDetail;
// src/components/reviews/calibration/CalibrationSessionList.jsx
import React, { useState } from 'react';
import './calibration.css';
import CalibrationCard from './CalibrationCard';

const CalibrationSessionList = ({ 
    sessions = [], 
    loading = false, 
    onSessionClick, 
    onCreateClick,
    title = "Calibration Sessions"
}) => {
    const [filter, setFilter] = useState('all');

    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return session.status === 'active';
        if (filter === 'in_progress') return session.status === 'in_progress';
        if (filter === 'completed') return session.status === 'completed';
        return true;
    });

    const stats = {
        total: sessions.length,
        upcoming: sessions.filter(s => s.status === 'active').length,
        inProgress: sessions.filter(s => s.status === 'in_progress').length,
        completed: sessions.filter(s => s.status === 'completed').length,
    };

    if (loading) {
        return <div className="calibration-loading">Loading calibration sessions...</div>;
    }

    if (sessions.length === 0) {
        return (
            <div className="calibration-empty">
                <p>No calibration sessions found.</p>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        Create First Session
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="calibration-container">
            <div className="calibration-header">
                <div>
                    <h2 className="calibration-title">{title}</h2>
                    <p className="calibration-subtitle">Manage calibration sessions for fair rating distribution</p>
                </div>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Session
                    </button>
                )}
            </div>

            <div className="calibration-stats">
                <div className="calibration-stat-card">
                    <div className="calibration-stat-value">{stats.total}</div>
                    <div className="calibration-stat-label">Total Sessions</div>
                </div>
                <div className="calibration-stat-card">
                    <div className="calibration-stat-value">{stats.upcoming}</div>
                    <div className="calibration-stat-label">Upcoming</div>
                </div>
                <div className="calibration-stat-card">
                    <div className="calibration-stat-value">{stats.inProgress}</div>
                    <div className="calibration-stat-label">In Progress</div>
                </div>
                <div className="calibration-stat-card">
                    <div className="calibration-stat-value">{stats.completed}</div>
                    <div className="calibration-stat-label">Completed</div>
                </div>
            </div>

            <div className="calibration-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                    className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    All
                </button>
                <button 
                    className={filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('upcoming')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Upcoming
                </button>
                <button 
                    className={filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('in_progress')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    In Progress
                </button>
                <button 
                    className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('completed')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Completed
                </button>
            </div>

            {filteredSessions.length === 0 ? (
                <div className="calibration-empty">
                    <p>No sessions match the selected filter.</p>
                </div>
            ) : (
                <div className="calibration-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredSessions.map(session => (
                        <CalibrationCard key={session.id} session={session} onClick={onSessionClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CalibrationSessionList;
// src/components/reviews/feedback/FeedbackRequestList.jsx
import React, { useState } from 'react';
import './feedback.css';
import FeedbackCard from './FeedbackCard';

const FeedbackRequestList = ({ 
    requests = [], 
    loading = false, 
    onRequestClick, 
    onCreateClick,
    onRespondClick,
    title = "Feedback Requests"
}) => {
    const [filter, setFilter] = useState('all');

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        if (filter === 'pending') return request.status === 'pending';
        if (filter === 'completed') return request.status === 'completed';
        return true;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        completed: requests.filter(r => r.status === 'completed').length,
        overdue: requests.filter(r => r.status === 'pending' && new Date(r.due_date) < new Date()).length,
    };

    if (loading) {
        return <div className="feedback-loading">Loading feedback requests...</div>;
    }

    return (
        <div className="feedback-container">
            <div className="feedback-header">
                <div>
                    <h2 className="feedback-title">{title}</h2>
                    <p className="feedback-subtitle">Manage 360-degree feedback requests</p>
                </div>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Request
                    </button>
                )}
            </div>

            <div className="feedback-stats">
                <div className="feedback-stat-card">
                    <div className="feedback-stat-value">{stats.total}</div>
                    <div className="feedback-stat-label">Total Requests</div>
                </div>
                <div className="feedback-stat-card">
                    <div className="feedback-stat-value">{stats.pending}</div>
                    <div className="feedback-stat-label">Pending</div>
                </div>
                <div className="feedback-stat-card">
                    <div className="feedback-stat-value">{stats.completed}</div>
                    <div className="feedback-stat-label">Completed</div>
                </div>
                <div className="feedback-stat-card">
                    <div className="feedback-stat-value">{stats.overdue}</div>
                    <div className="feedback-stat-label">Overdue</div>
                </div>
            </div>

            <div className="feedback-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                    className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    All
                </button>
                <button 
                    className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('pending')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Pending
                </button>
                <button 
                    className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('completed')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Completed
                </button>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="feedback-empty">
                    <p>No feedback requests found.</p>
                </div>
            ) : (
                <div className="feedback-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredRequests.map(request => (
                        <FeedbackCard 
                            key={request.id} 
                            feedback={request} 
                            onClick={request.status === 'pending' && onRespondClick ? () => onRespondClick(request.id) : onRequestClick}
                            type="request"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackRequestList;
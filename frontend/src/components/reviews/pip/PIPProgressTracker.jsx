// src/components/reviews/pip/PIPProgressTracker.jsx
import React from 'react';
import './pip.css';

const PIPProgressTracker = ({ pip, actions = [] }) => {
    const totalActions = actions.length;
    const completedActions = actions.filter(a => a.status === 'completed').length;
    const inProgressActions = actions.filter(a => a.status === 'in_progress').length;
    const missedActions = actions.filter(a => a.status === 'missed').length;
    
    const completionPercentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
    
    const getProgressClass = () => {
        if (completionPercentage >= 100) return 'completed';
        if (completionPercentage >= 50) return 'warning';
        return '';
    };

    // Calculate days remaining
    const today = new Date();
    const endDate = pip.extended_to_date ? new Date(pip.extended_to_date) : new Date(pip.end_date);
    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.ceil((endDate - new Date(pip.start_date)) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDays - daysRemaining;
    const timePercentage = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

    const isOnTrack = completionPercentage >= timePercentage;

    return (
        <div className="pip-progress-tracker">
            <div className="progress-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{totalActions}</div>
                    <div className="progress-stat-label">Total Actions</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{completedActions}</div>
                    <div className="progress-stat-label">Completed</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{inProgressActions}</div>
                    <div className="progress-stat-label">In Progress</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{missedActions}</div>
                    <div className="progress-stat-label">Missed</div>
                </div>
            </div>

            <div className="progress-bar-container" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Action Completion</span>
                    <span>{completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className={`progress-bar-fill ${getProgressClass()}`}
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            <div className="progress-bar-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Time Elapsed</span>
                    <span>{daysElapsed} / {totalDays} days ({timePercentage}%)</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className={`progress-bar-fill ${timePercentage >= 100 ? 'completed' : timePercentage >= 75 ? 'warning' : ''}`}
                        style={{ width: `${timePercentage}%`, background: isOnTrack ? '#3b82f6' : '#f59e0b' }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Status:</span>
                    <span style={{ 
                        fontWeight: 600,
                        color: isOnTrack ? '#10b981' : '#f59e0b'
                    }}>
                        {isOnTrack ? 'On Track' : 'Behind Schedule'}
                    </span>
                </div>
                {daysRemaining > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {daysRemaining} days remaining until deadline
                    </div>
                )}
                {missedActions > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
                        ⚠️ {missedActions} missed action(s) require attention
                    </div>
                )}
            </div>
        </div>
    );
};

export default PIPProgressTracker;
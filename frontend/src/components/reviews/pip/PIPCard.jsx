// src/components/reviews/pip/PIPCard.jsx
import React from 'react';
import './pip.css';
import PIPStatusBadge from './PIPStatusBadge';

const PIPCard = ({ pip, onClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getProgressPercentage = () => {
        if (!pip.actions || pip.actions.length === 0) return 0;
        const completed = pip.actions.filter(a => a.status === 'completed').length;
        return Math.round((completed / pip.actions.length) * 100);
    };

    const getProgressClass = (percentage) => {
        if (percentage >= 100) return 'completed';
        if (percentage >= 50) return 'warning';
        return '';
    };

    const progress = getProgressPercentage();
    const progressClass = getProgressClass(progress);
    const isOverdue = pip.is_overdue;

    return (
        <div className="pip-card" onClick={() => onClick?.(pip.id)}>
            <div className="pip-card-header">
                <div>
                    <h3 className="pip-card-title">{pip.title}</h3>
                    <div className="pip-card-employee">{pip.employee_name || pip.employee?.name}</div>
                </div>
                <PIPStatusBadge status={pip.status} severity={pip.severity} showSeverity />
            </div>
            
            <div className="pip-card-dates">
                <span>📅 {formatDate(pip.start_date)} - {formatDate(pip.end_date)}</span>
                {isOverdue && <span style={{ color: '#ef4444' }}>⚠️ Overdue</span>}
                {pip.days_remaining > 0 && !isOverdue && (
                    <span>{pip.days_remaining} days left</span>
                )}
            </div>
            
            <div className="pip-card-progress">
                <div className="pip-progress-bar">
                    <div 
                        className={`pip-progress-fill ${progressClass}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="pip-progress-text">{progress}% Complete</div>
            </div>
        </div>
    );
};

export default PIPCard;
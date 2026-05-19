// src/components/reviews/cycle/CycleCard.jsx
import React from 'react';
import './cycle.css';
import CycleStatusBadge from './CycleStatusBadge';

const CycleCard = ({ cycle, onClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getCycleTypeLabel = (type) => {
        const types = {
            mid_year: 'Mid-Year',
            end_year: 'End-Year',
            quarterly: 'Quarterly',
            probation: 'Probation',
            special: 'Special',
            pip: 'PIP',
        };
        return types[type] || type;
    };

    return (
        <div className="cycle-card" onClick={() => onClick?.(cycle.id)}>
            <div className="cycle-card-header">
                <h3 className="cycle-card-title">{cycle.name}</h3>
                <CycleStatusBadge status={cycle.status} />
            </div>
            
            <div className="cycle-card-dates">
                <span>📅 {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}</span>
            </div>
            
            {cycle.description && (
                <p className="cycle-card-description">{cycle.description}</p>
            )}
            
            <div className="cycle-card-stats">
                <div className="cycle-stat">
                    <span className="cycle-stat-value">{getCycleTypeLabel(cycle.cycle_type)}</span>
                    <span className="cycle-stat-label">Type</span>
                </div>
                {cycle.days_remaining !== undefined && cycle.days_remaining > 0 && (
                    <div className="cycle-stat">
                        <span className="cycle-stat-value">{cycle.days_remaining}</span>
                        <span className="cycle-stat-label">Days Left</span>
                    </div>
                )}
                {cycle.is_active_period && (
                    <div className="cycle-stat">
                        <span className="cycle-stat-value">●</span>
                        <span className="cycle-stat-label">Active Now</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CycleCard;
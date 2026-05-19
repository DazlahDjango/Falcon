// src/components/reviews/ratingScale/RatingScaleCard.jsx
import React from 'react';
import './ratingScale.css';

const RatingScaleCard = ({ ratingScale, onClick }) => {
    const levelCount = ratingScale.levels?.length || 0;

    return (
        <div className="ratingscale-card" onClick={() => onClick?.(ratingScale.id)}>
            <div className="ratingscale-card-header">
                <h3 className="ratingscale-card-title">{ratingScale.name}</h3>
                <div>
                    {ratingScale.is_default && (
                        <span className="ratingscale-card-badge ratingscale-badge-default" style={{ marginRight: '0.5rem' }}>
                            Default
                        </span>
                    )}
                    {ratingScale.is_active && (
                        <span className="ratingscale-card-badge ratingscale-badge-active">
                            Active
                        </span>
                    )}
                </div>
            </div>
            
            {ratingScale.description && (
                <p className="ratingscale-card-description">{ratingScale.description}</p>
            )}
            
            <div className="ratingscale-card-stats">
                <div className="ratingscale-stat">
                    <span className="ratingscale-stat-value">{levelCount}</span>
                    <span className="ratingscale-stat-label">Levels</span>
                </div>
                <div className="ratingscale-stat">
                    <span className="ratingscale-stat-value">
                        {ratingScale.min_value} - {ratingScale.max_value}
                    </span>
                    <span className="ratingscale-stat-label">Range</span>
                </div>
                {ratingScale.allow_decimal && (
                    <div className="ratingscale-stat">
                        <span className="ratingscale-stat-value">✓</span>
                        <span className="ratingscale-stat-label">Decimals</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingScaleCard;
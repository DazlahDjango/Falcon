// src/components/reviews/ratingScale/RatingScaleList.jsx
import React, { useState } from 'react';
import './ratingScale.css';
import RatingScaleCard from './RatingScaleCard';

const RatingScaleList = ({ 
    ratingScales = [], 
    loading = false, 
    onScaleClick, 
    onCreateClick,
    onSetDefault,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const filteredScales = ratingScales.filter(scale => {
        const matchesSearch = scale.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActive = !showActiveOnly || scale.is_active;
        return matchesSearch && matchesActive;
    });

    if (loading) {
        return <div className="ratingscale-loading">Loading rating scales...</div>;
    }

    if (!ratingScales || ratingScales.length === 0) {
        return (
            <div className="ratingscale-empty">
                <p>No rating scales found.</p>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        Create First Rating Scale
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="ratingscale-container">
            <div className="ratingscale-header">
                <h2 className="ratingscale-title">Rating Scales</h2>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Rating Scale
                    </button>
                )}
            </div>

            <div className="ratingscale-filters">
                <input
                    type="text"
                    placeholder="Search rating scales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ width: '250px' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={showActiveOnly}
                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                    />
                    Show active only
                </label>
            </div>

            <div className="ratingscale-list">
                {filteredScales.map(scale => (
                    <RatingScaleCard 
                        key={scale.id} 
                        ratingScale={scale} 
                        onClick={onScaleClick}
                    />
                ))}
            </div>

            {filteredScales.length === 0 && (
                <div className="ratingscale-empty">
                    <p>No rating scales match your filters.</p>
                </div>
            )}
        </div>
    );
};

export default RatingScaleList;
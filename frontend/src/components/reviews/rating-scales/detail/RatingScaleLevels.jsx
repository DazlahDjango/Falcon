// src/components/reviews/rating-scales/detail/RatingScaleLevels.jsx
import React from 'react';

const RatingScaleLevels = ({ levels = [] }) => {
  if (!levels || levels.length === 0) {
    return (
      <div className="rating-scale-levels">
        <h3 className="rating-scale-levels-title">Rating Levels</h3>
        <p className="rating-scale-levels-empty">No levels defined</p>
      </div>
    );
  }

  return (
    <div className="rating-scale-levels">
      <h3 className="rating-scale-levels-title">Rating Levels</h3>
      <div className="rating-scale-levels-list">
        {levels.map((level, index) => (
          <div key={index} className="rating-scale-level-item">
            <div
              className="rating-scale-level-color"
              style={{ backgroundColor: level.color || '#e5e7eb' }}
            />
            <div className="rating-scale-level-content">
              <div className="rating-scale-level-label">{level.label}</div>
              {level.description && (
                <div className="rating-scale-level-description">{level.description}</div>
              )}
            </div>
            <div className="rating-scale-level-range">
              Score: {level.value} | Min: {level.min_pct || 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingScaleLevels;
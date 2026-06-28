// src/components/reviews/self-assessments/form/SelfAssessmentCompetencyRating.jsx
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';

const SelfAssessmentCompetencyRating = ({ ratings = [], onChange, disabled = false }) => {
  const { data: competencies, loading } = useCompetencies();
  const [expanded, setExpanded] = useState(true);
  const [localRatings, setLocalRatings] = useState({});

  useEffect(() => {
    if (ratings.length > 0) {
      const map = {};
      ratings.forEach((r) => {
        map[r.competency_id] = { score: r.raw_score, comment: r.comment || '' };
      });
      setLocalRatings(map);
    } else if (competencies.length > 0) {
      const map = {};
      competencies.forEach((c) => {
        map[c.id] = { score: null, comment: '' };
      });
      setLocalRatings(map);
    }
  }, [ratings, competencies]);

  const handleRatingChange = (competencyId, score) => {
    const updated = { ...localRatings, [competencyId]: { ...localRatings[competencyId], score } };
    setLocalRatings(updated);
    // Convert to array format
    const ratingsArray = Object.entries(updated).map(([key, value]) => ({
      competency_id: key,
      raw_score: value.score,
      comment: value.comment || '',
    }));
    onChange(ratingsArray);
  };

  const handleCommentChange = (competencyId, comment) => {
    const updated = { ...localRatings, [competencyId]: { ...localRatings[competencyId], comment } };
    setLocalRatings(updated);
    const ratingsArray = Object.entries(updated).map(([key, value]) => ({
      competency_id: key,
      raw_score: value.score,
      comment: value.comment || '',
    }));
    onChange(ratingsArray);
  };

  if (loading) return <div className="self-assessment-rating-loading">Loading competencies...</div>;

  return (
    <div className="self-assessment-competency-rating">
      <div className="self-assessment-rating-header" onClick={() => setExpanded(!expanded)}>
        <h3 className="self-assessment-rating-title">Competency Ratings</h3>
        <button className="self-assessment-rating-toggle">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className="self-assessment-rating-list">
          {competencies.map((competency) => {
            const rating = localRatings[competency.id] || { score: null, comment: '' };
            const score = rating.score;

            return (
              <div key={competency.id} className="self-assessment-rating-item">
                <div className="self-assessment-rating-item-header">
                  <span className="self-assessment-rating-item-name">{competency.name}</span>
                  <span className="self-assessment-rating-item-type">
                    {competency.competency_type?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="self-assessment-rating-item-body">
                  <div className="self-assessment-rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`self-assessment-rating-star ${score >= star ? 'active' : ''}`}
                        onClick={() => !disabled && handleRatingChange(competency.id, star)}
                        disabled={disabled}
                        type="button"
                      >
                        <Star
                          size={24}
                          fill={score >= star ? '#f59e0b' : 'none'}
                          color={score >= star ? '#f59e0b' : '#d1d5db'}
                        />
                      </button>
                    ))}
                    <span className="self-assessment-rating-score">
                      {score ? `${score}/5` : 'Not rated'}
                    </span>
                  </div>
                  <textarea
                    className="self-assessment-rating-comment"
                    placeholder="Add a comment..."
                    value={rating.comment || ''}
                    onChange={(e) => handleCommentChange(competency.id, e.target.value)}
                    disabled={disabled}
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentCompetencyRating;
// src/components/reviews/pips/detail/PIPReviews.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectPIPReviewsForPIP } from '../../../../store/reviews/selectors';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewStatusBadge } from '../../common';
import { Calendar, User, FileText, Plus, X } from 'lucide-react';

const PIPReviews = ({ pipId }) => {
  const reviews = useSelector((state) => selectPIPReviewsForPIP(state));
  const { addReview, canManage } = usePIP();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    accomplishments: '',
    challenges: '',
    action_items: '',
    rating: '',
    employee_attended: true,
  });

  useEffect(() => {
    // Fetch reviews when component mounts
  }, [pipId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addReview(pipId, formData);
      setShowForm(false);
      setFormData({
        summary: '',
        accomplishments: '',
        challenges: '',
        action_items: '',
        rating: '',
        employee_attended: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!reviews) return <ReviewLoading size="sm" text="Loading reviews..." />;

  return (
    <div className="pip-reviews">
      <div className="pip-reviews-header">
        <h3 className="pip-reviews-title">Reviews</h3>
        {canManage && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} />
            Add Review
          </button>
        )}
      </div>

      {showForm && (
        <form className="pip-reviews-form" onSubmit={handleSubmit}>
          <div className="pip-reviews-form-group">
            <label className="pip-reviews-form-label">Summary *</label>
            <textarea
              className="pip-reviews-form-textarea"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Summary of the review..."
              rows={3}
              required
            />
          </div>
          <div className="pip-reviews-form-group">
            <label className="pip-reviews-form-label">Accomplishments</label>
            <textarea
              className="pip-reviews-form-textarea"
              value={formData.accomplishments}
              onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
              placeholder="Accomplishments since last review..."
              rows={2}
            />
          </div>
          <div className="pip-reviews-form-group">
            <label className="pip-reviews-form-label">Challenges</label>
            <textarea
              className="pip-reviews-form-textarea"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Challenges faced..."
              rows={2}
            />
          </div>
          <div className="pip-reviews-form-group">
            <label className="pip-reviews-form-label">Action Items</label>
            <textarea
              className="pip-reviews-form-textarea"
              value={formData.action_items}
              onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
              placeholder="Action items for next period..."
              rows={2}
            />
          </div>
          <div className="pip-reviews-form-row">
            <div className="pip-reviews-form-group">
              <label className="pip-reviews-form-label">Rating</label>
              <select
                className="pip-reviews-form-select"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              >
                <option value="">Select rating...</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="satisfactory">Satisfactory</option>
                <option value="needs_improvement">Needs Improvement</option>
                <option value="unsatisfactory">Unsatisfactory</option>
              </select>
            </div>
            <div className="pip-reviews-form-group">
              <label className="pip-reviews-form-label-checkbox">
                <input
                  type="checkbox"
                  checked={formData.employee_attended}
                  onChange={(e) => setFormData({ ...formData, employee_attended: e.target.checked })}
                />
                Employee Attended
              </label>
            </div>
          </div>
          <div className="pip-reviews-form-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowForm(false)}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !formData.summary}
            >
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add Review'}
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="pip-reviews-empty">No reviews yet</div>
      ) : (
        <div className="pip-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="pip-reviews-item">
              <div className="pip-reviews-item-header">
                <div className="pip-reviews-item-info">
                  <span className="pip-reviews-item-reviewer">
                    <User size={14} />
                    {review.reviewer_name}
                  </span>
                  <span className="pip-reviews-item-date">
                    <Calendar size={14} />
                    {new Date(review.review_date).toLocaleDateString()}
                  </span>
                  {review.rating && (
                    <ReviewStatusBadge status={review.rating} size="sm" />
                  )}
                </div>
                {review.employee_attended && (
                  <span className="pip-reviews-item-attended">✓ Attended</span>
                )}
              </div>
              <div className="pip-reviews-item-body">
                {review.summary && (
                  <div className="pip-reviews-item-section">
                    <span className="pip-reviews-item-label">Summary</span>
                    <p className="pip-reviews-item-text">{review.summary}</p>
                  </div>
                )}
                {review.accomplishments && (
                  <div className="pip-reviews-item-section">
                    <span className="pip-reviews-item-label">Accomplishments</span>
                    <p className="pip-reviews-item-text">{review.accomplishments}</p>
                  </div>
                )}
                {review.challenges && (
                  <div className="pip-reviews-item-section">
                    <span className="pip-reviews-item-label">Challenges</span>
                    <p className="pip-reviews-item-text">{review.challenges}</p>
                  </div>
                )}
                {review.action_items && (
                  <div className="pip-reviews-item-section">
                    <span className="pip-reviews-item-label">Action Items</span>
                    <p className="pip-reviews-item-text">{review.action_items}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PIPReviews;
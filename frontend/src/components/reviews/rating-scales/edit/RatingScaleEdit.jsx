// src/components/reviews/rating-scales/edit/RatingScaleEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useRatingScales } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import RatingScaleForm from '../create/RatingScaleForm';
import RatingScaleLevelEditor from '../create/RatingScaleLevelEditor';

const RatingScaleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, update: updateRatingScale } = useRatingScales();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name || '',
        description: selected.description || '',
        min_value: selected.min_value || 1,
        max_value: selected.max_value || 5,
        allow_decimal: selected.allow_decimal || false,
        reverse_scoring: selected.reverse_scoring || false,
        is_active: selected.is_active || true,
        levels: selected.levels || [],
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    if (!formData.name.trim()) {
      alert('Please enter a rating scale name.');
      return;
    }
    if (formData.levels.length === 0) {
      alert('Please add at least one rating level to the rating scale before saving.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRatingScale(id, formData).unwrap();
      navigate(`/reviews/rating-scales/${id}`);
    } catch (error) {
      alert(error?.message || 'Failed to update rating scale. Please check your inputs.');
      console.error('Failed to update rating scale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleLevelsChange = (levels) => {
    setFormData((prev) => ({ ...prev, levels }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading rating scale..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="rating-scale-edit">
      <div className="rating-scale-edit-header">
        <button className="rating-scale-edit-back" onClick={() => navigate(`/reviews/rating-scales/${id}`)}>
          <ArrowLeft size={20} />
          Back to Rating Scale
        </button>
        <h1 className="rating-scale-edit-title">Edit Rating Scale</h1>
      </div>

      <form onSubmit={handleSubmit} className="rating-scale-edit-form">
        <div className="rating-scale-edit-grid">
          <RatingScaleForm
            data={formData}
            onChange={handleFormChange}
          />
          <RatingScaleLevelEditor
            levels={formData.levels}
            onChange={handleLevelsChange}
            minValue={formData.min_value}
            maxValue={formData.max_value}
          />
        </div>

        <div className="rating-scale-edit-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/reviews/rating-scales/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingScaleEdit;
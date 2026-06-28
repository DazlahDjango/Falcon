// src/components/reviews/rating-scales/create/RatingScaleCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useRatingScales } from '../../../../hooks/reviews';
import RatingScaleForm from './RatingScaleForm';
import RatingScaleLevelEditor from './RatingScaleLevelEditor';

const RatingScaleCreate = () => {
  const navigate = useNavigate();
  const { createRatingScale, loading } = useRatingScales();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_value: 1,
    max_value: 5,
    allow_decimal: false,
    reverse_scoring: false,
    is_active: true,
    levels: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRatingScale(formData);
      navigate('/reviews/rating-scales');
    } catch (error) {
      console.error('Failed to create rating scale:', error);
    }
  };

  const handleFormChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleLevelsChange = (levels) => {
    setFormData((prev) => ({ ...prev, levels }));
  };

  return (
    <div className="rating-scale-create">
      <div className="rating-scale-create-header">
        <button className="rating-scale-create-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <h1 className="rating-scale-create-title">Create Rating Scale</h1>
      </div>

      <form onSubmit={handleSubmit} className="rating-scale-create-form">
        <div className="rating-scale-create-grid">
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

        <div className="rating-scale-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/rating-scales')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.name || formData.levels.length === 0}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Rating Scale'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingScaleCreate;
// src/components/reviews/promotions/create/PromotionCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePromotions } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import PromotionForm from './PromotionForm';

const PromotionCreate = () => {
  const navigate = useNavigate();
  const { create, loading } = usePromotions();
  const [formData, setFormData] = useState({
    employee: '',
    review_cycle: '',
    final_rating: '',
    recommended_by: '',
    current_role: '',
    current_level: '',
    recommended_role: '',
    recommended_level: '',
    priority: 'medium',
    justification: '',
    supporting_evidence: '',
    target_promotion_date: '',
    current_salary: '',
    proposed_salary: '',
    status: 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create(formData);
      navigate('/reviews/promotions');
    } catch (error) {
      console.error('Failed to create promotion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating promotion..." />;

  return (
    <div className="promotion-create">
      <div className="promotion-create-header">
        <button className="promotion-create-back" onClick={() => navigate('/reviews/promotions')}>
          <ArrowLeft size={20} />
          Back to Promotions
        </button>
        <h1 className="promotion-create-title">Create Promotion Recommendation</h1>
      </div>

      <form onSubmit={handleSubmit} className="promotion-create-form">
        <PromotionForm
          data={formData}
          onChange={handleChange}
        />

        <div className="promotion-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/promotions')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.employee || !formData.recommended_role}
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Promotion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromotionCreate;
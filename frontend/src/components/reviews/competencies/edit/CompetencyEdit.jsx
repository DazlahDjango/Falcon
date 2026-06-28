// src/components/reviews/competencies/edit/CompetencyEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CompetencyForm from '../create/CompetencyForm';

const CompetencyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, update, canManage } = useCompetencies();
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
        competency_type: selected.competency_type || 'technical',
        category: selected.category || '',
        default_weight: selected.default_weight || 10,
        is_active: selected.is_active || false,
        is_required: selected.is_required || false,
        display_order: selected.display_order || 0,
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await update(id, formData);
      navigate(`/reviews/competencies/${id}`);
    } catch (error) {
      console.error('Failed to update competency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading competency..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="competency-edit">
      <div className="competency-edit-header">
        <button className="competency-edit-back" onClick={() => navigate(`/reviews/competencies/${id}`)}>
          <ArrowLeft size={20} />
          Back to Competency
        </button>
        <h1 className="competency-edit-title">Edit Competency</h1>
      </div>

      <form onSubmit={handleSubmit} className="competency-edit-form">
        <CompetencyForm data={formData} onChange={handleChange} />
        <div className="competency-edit-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/reviews/competencies/${id}`)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.name}>
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetencyEdit;
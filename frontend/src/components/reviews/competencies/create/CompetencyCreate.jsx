// src/components/reviews/competencies/create/CompetencyCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import CompetencyForm from './CompetencyForm';
import CompetencyHelpGuide from './CompetencyHelpGuide';

const CompetencyCreate = () => {
  const navigate = useNavigate();
  const { create, loading } = useCompetencies();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    competency_type: 'technical',
    category: '',
    default_weight: 10,
    rating_scale: '',
    is_active: true,
    is_required: false,
    display_order: 0,
    excellent_behavior: '',
    needs_improvement_behavior: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create(formData);
      navigate('/reviews/competencies');
    } catch (error) {
      console.error('Failed to create competency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating competency..." />;

  return (
    <div className="competency-create">
      <div className="competency-create-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="competency-create-back" onClick={() => navigate('/reviews/competencies')}>
            <ArrowLeft size={20} />
            Back to Competencies
          </button>
          <h1 className="competency-create-title">Create Competency</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? 'Hide Help Guide' : 'Show Help Guide'}
        </button>
      </div>

      <div className={showGuide ? "competency-create-layout" : "competency-form-container-single"}>
        <form onSubmit={handleSubmit} className="competency-create-form">
          <CompetencyForm data={formData} onChange={handleChange} />
          <div className="competency-create-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/reviews/competencies')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.name}>
              <Save size={18} />
              {isSubmitting ? 'Creating...' : 'Create Competency'}
            </button>
          </div>
        </form>

        {showGuide && <CompetencyHelpGuide />}
      </div>
    </div>
  );
};

export default CompetencyCreate;
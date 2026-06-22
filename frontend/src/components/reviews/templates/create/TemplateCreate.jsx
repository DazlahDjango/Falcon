// src/components/reviews/templates/create/TemplateCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTemplates } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import TemplateForm from './TemplateForm';
import TemplateSectionEditor from './TemplateSectionEditor';

const TemplateCreate = () => {
  const navigate = useNavigate();
  const { create, loading } = useTemplates();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    included_sections: [],
    custom_sections: [],
    required_sections: [],
    section_order: [],
    applies_to_self_assessment: true,
    applies_to_supervisor_review: true,
    applies_to_360_feedback: false,
    max_strength_chars: 500,
    max_improvement_chars: 500,
    max_goals_chars: 500,
    is_active: true,
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create(formData);
      navigate('/reviews/templates');
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating template..." />;

  return (
    <div className="template-create">
      <div className="template-create-header">
        <button className="template-create-back" onClick={() => navigate('/reviews/templates')}>
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <h1 className="template-create-title">Create Review Template</h1>
      </div>

      <form onSubmit={handleSubmit} className="template-create-form">
        <div className="template-create-grid">
          <div className="template-create-main">
            <TemplateForm
              data={formData}
              onChange={handleChange}
            />
          </div>
          <div className="template-create-sidebar">
            <TemplateSectionEditor
              sections={formData.included_sections}
              requiredSections={formData.required_sections}
              onChange={(sections, required) => {
                handleChange({
                  included_sections: sections,
                  required_sections: required,
                });
              }}
            />
          </div>
        </div>

        <div className="template-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/templates')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.name || formData.included_sections.length === 0}
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateCreate;
// src/components/reviews/templates/edit/TemplateEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTemplates } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import TemplateForm from '../create/TemplateForm';
import TemplateSectionEditor from '../create/TemplateSectionEditor';

const TemplateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, updateTemplate } = useTemplates();
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
        included_sections: selected.included_sections || [],
        custom_sections: selected.custom_sections || [],
        required_sections: selected.required_sections || [],
        section_order: selected.section_order || [],
        applies_to_self_assessment: selected.applies_to_self_assessment || false,
        applies_to_supervisor_review: selected.applies_to_supervisor_review || false,
        applies_to_360_feedback: selected.applies_to_360_feedback || false,
        max_strength_chars: selected.max_strength_chars || 500,
        max_improvement_chars: selected.max_improvement_chars || 500,
        max_goals_chars: selected.max_goals_chars || 500,
        is_active: selected.is_active || false,
        is_default: selected.is_default || false,
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await updateTemplate(id, formData);
      navigate(`/reviews/templates/${id}`);
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading template..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="template-edit">
      <div className="template-edit-header">
        <button className="template-edit-back" onClick={() => navigate(`/reviews/templates/${id}`)}>
          <ArrowLeft size={20} />
          Back to Template
        </button>
        <h1 className="template-edit-title">Edit Template</h1>
      </div>

      <form onSubmit={handleSubmit} className="template-edit-form">
        <div className="template-edit-grid">
          <div className="template-edit-main">
            <TemplateForm
              data={formData}
              onChange={handleChange}
            />
          </div>
          <div className="template-edit-sidebar">
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

        <div className="template-edit-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/reviews/templates/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.name || formData.included_sections.length === 0}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEdit;
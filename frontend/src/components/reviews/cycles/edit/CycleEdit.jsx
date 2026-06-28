// src/components/reviews/cycles/edit/CycleEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCycles } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CycleForm from '../create/CycleForm';
import CycleCompetencyEditor from '../create/CycleCompetencyEditor';
import CycleDepartmentSelector from '../create/CycleDepartmentSelector';

const CycleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, updateCycle } = useCycles();
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
        cycle_type: selected.cycle_type || 'annual',
        start_date: selected.start_date || '',
        end_date: selected.end_date || '',
        self_assessment_deadline: selected.self_assessment_deadline || '',
        supervisor_review_deadline: selected.supervisor_review_deadline || '',
        final_approval_deadline: selected.final_approval_deadline || '',
        kpi_weight: selected.kpi_weight || 70,
        competency_weight: selected.competency_weight || 30,
        mission_weight: selected.mission_weight || 0,
        task_weight: selected.task_weight || 0,
        include_all_departments: selected.include_all_departments || true,
        require_self_assessment: selected.require_self_assessment || true,
        allow_self_assessment_edit: selected.allow_self_assessment_edit || true,
        enable_calibration: selected.enable_calibration || true,
        rating_scale_id: selected.rating_scale_id || '',
        competencies: selected.competencies || [],
        included_departments: selected.included_departments || [],
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await updateCycle(id, formData);
      navigate(`/reviews/cycles/${id}`);
    } catch (error) {
      console.error('Failed to update cycle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading cycle..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="cycle-edit">
      <div className="cycle-edit-header">
        <button className="cycle-edit-back" onClick={() => navigate(`/reviews/cycles/${id}`)}>
          <ArrowLeft size={20} />
          Back to Cycle
        </button>
        <h1 className="cycle-edit-title">Edit Review Cycle</h1>
      </div>

      <form onSubmit={handleSubmit} className="cycle-edit-form">
        <div className="cycle-edit-grid">
          <div className="cycle-edit-main">
            <CycleForm data={formData} onChange={handleChange} />
            <CycleCompetencyEditor
              competencies={formData.competencies}
              onChange={(competencies) => handleChange({ competencies })}
            />
          </div>
          <div className="cycle-edit-sidebar">
            <CycleDepartmentSelector
              selected={formData.included_departments}
              includeAll={formData.include_all_departments}
              onChange={(data) => handleChange(data)}
            />
          </div>
        </div>

        <div className="cycle-edit-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/reviews/cycles/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.name || !formData.start_date || !formData.end_date}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CycleEdit;
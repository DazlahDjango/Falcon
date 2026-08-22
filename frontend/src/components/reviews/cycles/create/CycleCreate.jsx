// src/components/reviews/cycles/create/CycleCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCycles } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import CycleForm from './CycleForm';
import CycleCompetencyEditor from './CycleCompetencyEditor';
import CycleDepartmentSelector from './CycleDepartmentSelector';
import CycleHelpGuide from './CycleHelpGuide';

const CycleCreate = () => {
  const navigate = useNavigate();
  const { createCycle, loading } = useCycles();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cycle_type: 'annual',
    start_date: '',
    end_date: '',
    self_assessment_deadline: '',
    supervisor_review_deadline: '',
    final_approval_deadline: '',
    kpi_weight: 70,
    competency_weight: 30,
    mission_weight: 0,
    task_weight: 0,
    include_all_departments: true,
    require_self_assessment: true,
    allow_self_assessment_edit: true,
    enable_calibration: true,
    rating_scale: '',
    competencies: [],
    included_departments: [],
  });
  const [showGuide, setShowGuide] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      let selfDeadline = formData.self_assessment_deadline;
      let supDeadline = formData.supervisor_review_deadline;
      let appDeadline = formData.final_approval_deadline;

      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date).getTime();
        const end = new Date(formData.end_date).getTime();
        const totalDuration = end - start;
        if (totalDuration > 0) {
          if (!selfDeadline) {
            selfDeadline = new Date(start + totalDuration * 0.4).toISOString().split('T')[0];
          }
          if (!supDeadline) {
            supDeadline = new Date(start + totalDuration * 0.7).toISOString().split('T')[0];
          }
          if (!appDeadline) {
            appDeadline = new Date(start + totalDuration * 0.9).toISOString().split('T')[0];
          }
        }
      }

      const payload = {
        ...formData,
        self_assessment_deadline: selfDeadline,
        supervisor_review_deadline: supDeadline,
        final_approval_deadline: appDeadline,
        kpi_weight: Number(formData.kpi_weight) || 0,
        competency_weight: Number(formData.competency_weight) || 0,
        mission_weight: Number(formData.mission_weight) || 0,
        task_weight: Number(formData.task_weight) || 0,
        calibration_date: formData.calibration_date || null,
        kpi_start_date: formData.kpi_start_date || null,
        kpi_end_date: formData.kpi_end_date || null,
        competencies: (formData.competencies || []).map((c) => ({
          competency: c.competency || c.competency_id,
          competency_id: c.competency_id || c.competency,
          weight: Number(c.weight) || 0,
          display_order: c.display_order || 0,
        })),
        included_departments: formData.include_all_departments ? [] : (formData.included_departments || []),
      };
      await createCycle(payload);
      navigate('/reviews/cycles');
    } catch (error) {
      console.error('Failed to create cycle:', error);
      let msg = 'Failed to create review cycle.';
      if (typeof error === 'string') {
        msg = error;
      } else if (error?.detail && typeof error.detail === 'object') {
        msg = Object.entries(error.detail)
          .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : (typeof val === 'object' ? JSON.stringify(val) : val)}`)
          .join(' | ');
      } else if (error?.detail && typeof error.detail === 'string') {
        msg = error.detail;
      } else if (error?.error && typeof error.error === 'string') {
        msg = error.error;
      } else if (typeof error === 'object') {
        msg = Object.entries(error)
          .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : (typeof val === 'object' ? JSON.stringify(val) : val)}`)
          .join(' | ');
      }
      setSubmitError(msg);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating cycle..." />;

  return (
    <div className="cycle-create">
      {submitError && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {submitError}</span>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="cycle-create-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="cycle-create-back" onClick={() => navigate('/reviews/cycles')}>
            <ArrowLeft size={20} />
            Back to Cycles
          </button>
          <h1 className="cycle-create-title">Create Review Cycle</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? 'Hide Help Guide' : 'Show Help Guide'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cycle-create-form">
        <div className={showGuide ? "cycle-create-grid-with-guide" : "cycle-create-grid"}>
          <div className="cycle-create-main">
            <CycleForm data={formData} onChange={handleChange} />
            <CycleCompetencyEditor
              competencies={formData.competencies}
              onChange={(competencies) => handleChange({ competencies })}
            />
          </div>
          <div className="cycle-create-sidebar">
            <CycleDepartmentSelector
              selected={formData.included_departments}
              includeAll={formData.include_all_departments}
              onChange={(data) => handleChange(data)}
            />
          </div>
          {showGuide && <CycleHelpGuide />}
        </div>

        <div className="cycle-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/cycles')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.name || !formData.start_date || !formData.end_date || !formData.rating_scale}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Cycle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CycleCreate;
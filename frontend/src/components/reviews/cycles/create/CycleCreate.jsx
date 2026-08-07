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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCycle(formData);
      navigate('/reviews/cycles');
    } catch (error) {
      console.error('Failed to create cycle:', error);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating cycle..." />;

  return (
    <div className="cycle-create">
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
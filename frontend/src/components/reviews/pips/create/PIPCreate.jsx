// src/components/reviews/pips/create/PIPCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import PIPForm from './PIPForm';
import PIPActionEditor from './PIPActionEditor';

const PIPCreate = () => {
  const navigate = useNavigate();
  const { createPIP, loading } = usePIP();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employee: '',
    owner: '',
    review_cycle: '',
    severity: 'moderate',
    start_date: '',
    end_date: '',
    improvement_areas: '',
    success_criteria: '',
    consequences_if_failed: '',
    consequences_if_successful: '',
    actions: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPIP(formData);
      navigate('/reviews/pips');
    } catch (error) {
      console.error('Failed to create PIP:', error);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleActionsChange = (actions) => {
    setFormData((prev) => ({ ...prev, actions }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating PIP..." />;

  return (
    <div className="pip-create">
      <div className="pip-create-header">
        <button className="pip-create-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <h1 className="pip-create-title">Create Performance Improvement Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="pip-create-form">
        <div className="pip-create-grid">
          <div className="pip-create-main">
            <PIPForm data={formData} onChange={handleChange} />
          </div>
          <div className="pip-create-sidebar">
            <PIPActionEditor
              actions={formData.actions}
              onChange={handleActionsChange}
            />
          </div>
        </div>

        <div className="pip-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/pips')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.title || !formData.employee || !formData.start_date || !formData.end_date}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create PIP'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PIPCreate;
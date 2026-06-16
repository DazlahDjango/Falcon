// src/components/reviews/pips/edit/PIPEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import PIPForm from '../create/PIPForm';
import PIPActionEditor from '../create/PIPActionEditor';

const PIPEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, updatePIP } = usePIP();
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
        title: selected.title || '',
        description: selected.description || '',
        employee: selected.employee || '',
        owner: selected.owner || '',
        review_cycle: selected.review_cycle || '',
        severity: selected.severity || 'moderate',
        start_date: selected.start_date || '',
        end_date: selected.end_date || '',
        improvement_areas: selected.improvement_areas || '',
        success_criteria: selected.success_criteria || '',
        consequences_if_failed: selected.consequences_if_failed || '',
        consequences_if_successful: selected.consequences_if_successful || '',
        actions: selected.actions || [],
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await updatePIP(id, formData);
      navigate(`/reviews/pips/${id}`);
    } catch (error) {
      console.error('Failed to update PIP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleActionsChange = (actions) => {
    setFormData((prev) => ({ ...prev, actions }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading PIP..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="pip-edit">
      <div className="pip-edit-header">
        <button className="pip-edit-back" onClick={() => navigate(`/reviews/pips/${id}`)}>
          <ArrowLeft size={20} />
          Back to PIP
        </button>
        <h1 className="pip-edit-title">Edit PIP</h1>
      </div>

      <form onSubmit={handleSubmit} className="pip-edit-form">
        <div className="pip-edit-grid">
          <div className="pip-edit-main">
            <PIPForm data={formData} onChange={handleChange} />
          </div>
          <div className="pip-edit-sidebar">
            <PIPActionEditor
              actions={formData.actions}
              onChange={handleActionsChange}
            />
          </div>
        </div>

        <div className="pip-edit-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/reviews/pips/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.title || !formData.employee || !formData.start_date || !formData.end_date}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PIPEdit;
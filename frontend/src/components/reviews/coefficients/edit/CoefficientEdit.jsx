// src/components/reviews/coefficients/edit/CoefficientEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCoefficients } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CoefficientForm from '../create/CoefficientForm';
import CoefficientHelpGuide from '../create/CoefficientHelpGuide';

const CoefficientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, update } = useCoefficients();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  useEffect(() => {
    if (selected) {
      setFormData({
        coefficient_type: selected.coefficient_type || 'department',
        department: selected.department || '',
        position: selected.position || '',
        user: selected.user || '',
        value: Number(selected.value) || 1.0,
        reason: selected.reason || '',
        valid_from: selected.valid_from || '',
        valid_to: selected.valid_to || '',
        is_active: selected.is_active || false,
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await update(id, formData);
      navigate('/reviews/coefficients');
    } catch (error) {
      console.error('Failed to update coefficient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading coefficient..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!formData) return null;

  return (
    <div className="coefficient-create">
      <div className="coefficient-create-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="coefficient-create-back" onClick={() => navigate('/reviews/coefficients')}>
            <ArrowLeft size={20} />
            Back to Coefficients
          </button>
          <h1 className="coefficient-create-title">Edit Coefficient</h1>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? 'Hide Help Guide' : 'Show Help Guide'}
        </button>
      </div>

      <div className={showGuide ? "coefficient-create-layout" : "coefficient-form-container-single"}>
        <form onSubmit={handleSubmit} className="coefficient-create-form">
          <CoefficientForm data={formData} onChange={handleChange} />
          <div className="coefficient-create-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/reviews/coefficients')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.coefficient_type || !formData.value || !formData.valid_from}>
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {showGuide && <CoefficientHelpGuide />}
      </div>
    </div>
  );
};

export default CoefficientEdit;

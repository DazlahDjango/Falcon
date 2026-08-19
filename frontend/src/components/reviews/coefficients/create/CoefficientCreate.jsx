// src/components/reviews/coefficients/create/CoefficientCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCoefficients } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import CoefficientForm from './CoefficientForm';
import CoefficientHelpGuide from './CoefficientHelpGuide';

const CoefficientCreate = () => {
  const navigate = useNavigate();
  const { create, loading } = useCoefficients();
  const [formData, setFormData] = useState({
    coefficient_type: 'department',
    division: '',
    department: '',
    section: '',
    unit: '',
    position: '',
    user: '',
    value: 1.0,
    reason: '',
    valid_from: '',
    valid_to: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  console.log('[CoefficientCreate] rendering:', { formData, loading, isSubmitting });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CoefficientCreate] handleSubmit called with formData:', formData);
    setIsSubmitting(true);
    try {
      const payload = {
        coefficient_type: formData.coefficient_type,
        value: Number(formData.value) || 1.0,
        reason: formData.reason || '',
        valid_from: formData.valid_from,
        valid_to: formData.valid_to ? formData.valid_to : null,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        division: formData.coefficient_type === 'division' && formData.division ? formData.division : null,
        department: formData.coefficient_type === 'department' && formData.department ? formData.department : null,
        section: formData.coefficient_type === 'section' && formData.section ? formData.section : null,
        unit: formData.coefficient_type === 'unit' && formData.unit ? formData.unit : null,
        position: formData.coefficient_type === 'position' && formData.position ? formData.position : null,
        user: formData.coefficient_type === 'individual' && formData.user ? formData.user : null,
      };
      const result = await create(payload);
      console.log('[CoefficientCreate] create successful:', result);
      navigate('/reviews/coefficients');
    } catch (error) {
      console.error('[CoefficientCreate] Failed to create coefficient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (loading) return <ReviewLoading size="lg" text="Creating coefficient..." />;

  return (
    <div className="coefficient-create">
      <div className="coefficient-create-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="coefficient-create-back" onClick={() => navigate('/reviews/coefficients')}>
            <ArrowLeft size={20} />
            Back to Coefficients
          </button>
          <h1 className="coefficient-create-title">Create Coefficient</h1>
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
          <CoefficientForm
            data={formData}
            onChange={handleChange}
          />

          <div className="coefficient-create-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/reviews/coefficients')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.coefficient_type || !formData.value || !formData.valid_from}
            >
              <Save size={18} />
              {isSubmitting ? 'Creating...' : 'Create Coefficient'}
            </button>
          </div>
        </form>

        {showGuide && <CoefficientHelpGuide />}
      </div>
    </div>
  );
};

export default CoefficientCreate;